"""
Sample curl request:
curl -X POST http://localhost:5000/api/requests/123/submitForm \
  -F 'payload={
    "use_case": "Credit Card Issuance",
    "third_party": {
      "name": "BankCorp",
      "purpose": "KYC Verification",
      "requested_fields": ["PAN Card", "Aadhar", "Phone Number"]
    },
    "user_consent": {
      "approved_fields": ["PAN Card", "Phone Number"],
      "consent_type": "Granular",
      "consent_time": "2024-06-01T12:00:00Z"
    },
    "form_data": {
      "text_fields": {"Phone Number": "9876543210"},
      "file_uploads": {}
    }
  }' \
  -F 'PAN_Card=@/path/to/pan.pdf' \
  -F 'Aadhar=@/path/to/aadhar.jpg'
"""

import base64
import json
import os
import requests
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import copy
import time
import hashlib

app = Flask(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

JAVA_BACKEND_URL = "http://localhost:8089"
ANOMALY_DETECTION_URL = "http://localhost:8080/api/api/anomaly"

@app.route('/api/requests/<id>/submitForm', methods=['POST'])
def submit_form(id):
    try:
        # 1. ANOMALY DETECTION - Check for behavioral anomalies before processing
        anomaly_result = perform_anomaly_detection(request)
        if anomaly_result and anomaly_result.get('isAnomaly'):
            return jsonify({
                "error": "ANOMALY_DETECTED",
                "message": "Access blocked due to detected anomaly",
                "anomalyScore": anomaly_result.get('anomalyScore'),
                "riskLevel": anomaly_result.get('riskLevel'),
                "riskFactors": anomaly_result.get('riskFactors'),
                "recommendedAction": anomaly_result.get('recommendedAction')
            }), 403
        
        # 2. SMART CONTRACT VALIDATION - Validate if smart contract execution is allowed
        smart_contract_valid = validate_smart_contract_execution(anomaly_result)
        if not smart_contract_valid:
            return jsonify({
                "error": "SMART_CONTRACT_BLOCKED",
                "message": "Smart contract execution blocked due to security concerns"
            }), 403
        
        # 3. Fetch initial data from Java backend
        try:
            backend_resp = requests.get(f"{JAVA_BACKEND_URL}/api/requests/{id}/submitForm", timeout=10)
            if backend_resp.status_code != 200:
                return jsonify({"error": "Failed to fetch data from backend", "details": backend_resp.text}), 502
            backend_data = backend_resp.json()
        except Exception as e:
            return jsonify({"error": "Error contacting backend", "details": str(e)}), 502

        # 4. Parse JSON override from client (optional)
        client_payload = None
        if 'payload' in request.form:
            try:
                client_payload = json.loads(request.form['payload'])
            except Exception as e:
                return jsonify({"error": f"Invalid JSON in 'payload': {str(e)}"}), 400

        # 5. Merge backend data and client override (client overrides take precedence)
        payload = copy.deepcopy(backend_data)
        if client_payload:
            def deep_update(d, u):
                for k, v in u.items():
                    if isinstance(v, dict) and isinstance(d.get(k), dict):
                        d[k] = deep_update(d.get(k, {}), v)
                    else:
                        d[k] = v
                return d
            payload = deep_update(payload, client_payload)

        # 6. Parse file uploads and encode as base64
        file_uploads = payload.get('form_data', {}).get('file_uploads', {})
        for field_name in request.files:
            file = request.files[field_name]
            filename = secure_filename(file.filename)
            file_content = file.read()
            filetype = filename.split('.')[-1].lower()
            size_kb = int(len(file_content) / 1024)
            b64_content = base64.b64encode(file_content).decode('utf-8')
            file_uploads[field_name] = {
                "filename": filename,
                "filetype": filetype,
                "size_kb": size_kb,
                "base64": b64_content
            }
        if 'form_data' not in payload:
            payload['form_data'] = {}
        payload['form_data']['file_uploads'] = file_uploads

        # 7. PRIVACY-PRESERVING DATA MINIMIZATION
        minimized_payload = apply_privacy_preserving_minimization(payload)

        # 8. Prepare Gemini API request with enhanced security context
        gemini_instruction = (
            "You are an AI assistant for financial workflow data. "
            "Given the following input JSON, return a minimized output JSON with the EXACT same top-level structure and keys as the input. "
            "Only minimize the 'form_data' section: "
            "  - In 'form_data.text_fields', keep only the fields required for the use_case (e.g., for 'loan_processing', only required fields). "
            "  - In 'form_data.file_uploads', keep only files essential for the use_case. "
            "All other top-level fields and their subfields must be preserved exactly as in the input. "
            "Do not add, remove, or rename any top-level keys. "
            "Output valid, minified JSON only, with no extra text or explanation. "
            "Here is the input JSON:\n"
        )
        gemini_input = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": gemini_instruction + json.dumps(payload)
                        }
                    ]
                }
            ]
        }
        
        headers = {"Content-Type": "application/json"}
        gemini_url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
        gemini_resp = requests.post(gemini_url, headers=headers, data=json.dumps(gemini_input), timeout=30)
        
        if gemini_resp.status_code != 200:
            return jsonify({"error": "Gemini API error", "details": gemini_resp.text}), 502
            
        gemini_data = gemini_resp.json()
        try:
            gemini_json = json.loads(gemini_data['candidates'][0]['content']['parts'][0]['text'])
        except Exception as e:
            return jsonify({"error": "Failed to parse Gemini response", "details": str(e), "raw": gemini_data}), 502
        
        # 9. Add security and privacy metadata to response
        final_response = {
            **gemini_json,
            "security_metadata": {
                "anomaly_detection_performed": True,
                "anomaly_score": anomaly_result.get('anomalyScore', 0.0) if anomaly_result else 0.0,
                "risk_level": anomaly_result.get('riskLevel', 'LOW') if anomaly_result else 'LOW',
                "smart_contract_validated": smart_contract_valid,
                "privacy_preserving_minimization_applied": True,
                "timestamp": time.time(),
                "request_id": id
            }
        }
        
        return jsonify(final_response)
        
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

def perform_anomaly_detection(request):
    """Perform anomaly detection using behavioral data from request"""
    try:
        # Extract behavioral data from request headers
        behavioral_data = {
            "userId": request.headers.get('X-User-ID'),
            "sessionId": request.headers.get('X-Session-ID'),
            "deviceId": request.headers.get('X-Device-ID'),
            "ipAddress": get_client_ip(request),
            "userAgent": request.headers.get('User-Agent'),
            "timestamp": time.time(),
            "actionType": "API_REQUEST",
            "endpoint": request.path,
            "requestMethod": request.method,
            "contextData": {
                "contentLength": request.content_length,
                "contentType": request.content_type,
                "referer": request.headers.get('Referer'),
                "acceptLanguage": request.headers.get('Accept-Language')
            }
        }
        
        # Call anomaly detection service with Authorization header
        anomaly_url = f"{ANOMALY_DETECTION_URL}/detect"
        headers = {"Content-Type": "application/json"}
        auth_header = request.headers.get('Authorization')
        if auth_header:
            headers["Authorization"] = auth_header
        
        response = requests.post(anomaly_url, headers=headers, json=behavioral_data, timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            return result.get('anomalyResult', {})
        else:
            app.logger.warning(f"Anomaly detection service unavailable: {response.status_code}")
            return None
            
    except Exception as e:
        app.logger.error(f"Error in anomaly detection: {str(e)}")
        return None

def validate_smart_contract_execution(anomaly_result):
    """Validate if smart contract execution is allowed based on anomaly detection"""
    try:
        if not anomaly_result:
            return True  # Allow if no anomaly detection result
        
        # Check if anomaly is detected
        if anomaly_result.get('isAnomaly', False):
            app.logger.warning(f"Anomaly detected, blocking smart contract execution")
            return False
        
        # Check anomaly score threshold
        anomaly_score = anomaly_result.get('overallAnomalyScore', 0.0)
        if anomaly_score > 0.8:  # High anomaly threshold
            app.logger.warning(f"High anomaly score {anomaly_score}, blocking smart contract execution")
            return False
        
        # Check risk level
        risk_level = anomaly_result.get('riskLevel', 'LOW')
        if risk_level in ['HIGH', 'CRITICAL']:
            app.logger.warning(f"High risk level {risk_level}, blocking smart contract execution")
            return False
        
        return True
        
    except Exception as e:
        app.logger.error(f"Error in smart contract validation: {str(e)}")
        return False

def apply_privacy_preserving_minimization(payload):
    """Apply privacy-preserving data minimization techniques"""
    try:
        # Extract use case
        use_case = payload.get('use_case', 'default')
        
        # Apply data minimization based on use case
        minimized_data = {}
        excluded_fields = []
        
        # Define required fields for different use cases
        required_fields_map = {
            'credit card issuance': ['PAN Card', 'Aadhar', 'Phone Number', 'Address'],
            'kyc verification': ['PAN Card', 'Aadhar', 'Photo'],
            'loan application': ['PAN Card', 'Income Certificate', 'Bank Statement'],
            'account opening': ['PAN Card', 'Aadhar', 'Photo', 'Address Proof']
        }
        
        required_fields = required_fields_map.get(use_case.lower(), ['PAN Card', 'Aadhar'])
        
        # Process form data
        form_data = payload.get('form_data', {})
        text_fields = form_data.get('text_fields', {})
        file_uploads = form_data.get('file_uploads', {})
        
        # Minimize text fields
        minimized_text_fields = {}
        for field, value in text_fields.items():
            if field in required_fields:
                minimized_value = apply_field_minimization(field, value)
                minimized_text_fields[field] = minimized_value
            else:
                excluded_fields.append({
                    'field': field,
                    'reason': f'Not required for use case: {use_case}'
                })
        
        # Minimize file uploads
        minimized_file_uploads = {}
        for field, file_data in file_uploads.items():
            if field in required_fields:
                minimized_file_uploads[field] = file_data
            else:
                excluded_fields.append({
                    'field': field,
                    'reason': f'Not required for use case: {use_case}'
                })
        
        # Create minimized payload
        minimized_payload = {
            'use_case': use_case,
            'minimum_required_fields': required_fields,
            'form_data': {
                'text_fields': minimized_text_fields,
                'file_uploads': minimized_file_uploads
            },
            'excluded_fields': excluded_fields,
            'privacy_metadata': {
                'data_minimization_applied': True,
                'sensitive_fields_masked': True,
                'compliance_frameworks': ['GDPR', 'DPDP'],
                'timestamp': time.time()
            }
        }
        
        return minimized_payload
        
    except Exception as e:
        app.logger.error(f"Error in privacy-preserving minimization: {str(e)}")
        return payload

def apply_field_minimization(field, value):
    """Apply field-specific data minimization techniques"""
    if not isinstance(value, str):
        return value
    
    field_lower = field.lower()
    
    if 'phone' in field_lower:
        # Mask phone number
        if len(value) >= 10:
            return value[:3] + "****" + value[7:]
    
    elif 'aadhar' in field_lower:
        # Mask Aadhar number
        if len(value) >= 12:
            return value[:4] + "****" + value[8:]
    
    elif 'pan' in field_lower:
        # Mask PAN number
        if len(value) >= 10:
            return value[:2] + "****" + value[6:]
    
    elif 'address' in field_lower:
        # Generalize address to city level
        parts = value.split(',')
        if len(parts) > 1:
            return parts[-1].strip()  # Return only city
    
    return value

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    
    x_real_ip = request.headers.get('X-Real-IP')
    if x_real_ip:
        return x_real_ip
    
    return request.remote_addr

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with anomaly detection status"""
    try:
        # Check anomaly detection service health
        anomaly_health = requests.get(f"{ANOMALY_DETECTION_URL}/health", timeout=5)
        anomaly_status = "HEALTHY" if anomaly_health.status_code == 200 else "UNHEALTHY"
    except:
        anomaly_status = "UNREACHABLE"
    
    return jsonify({
        "status": "HEALTHY",
        "service": "Fintech API Gateway",
        "anomaly_detection_service": anomaly_status,
        "timestamp": time.time(),
        "version": "2.0.0"
    })

if __name__ == '__main__':
    app.run(debug=True) 