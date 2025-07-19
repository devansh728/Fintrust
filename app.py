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

app = Flask(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
GEMINI_API_KEY = "AIzaSyCj4Eu_KjetpGfSheXp3H0jvt9w6aoG9KA"

JAVA_BACKEND_URL = "http://localhost:8080"

@app.route('/api/requests/<id>/submitForm', methods=['POST'])
def submit_form(id):
    try:
        # 1. Fetch initial data from Java backend
        try:
            backend_resp = requests.get(f"{JAVA_BACKEND_URL}/api/requests/{id}/submitForm", timeout=10)
            if backend_resp.status_code != 200:
                return jsonify({"error": "Failed to fetch data from backend", "details": backend_resp.text}), 502
            backend_data = backend_resp.json()
        except Exception as e:
            return jsonify({"error": "Error contacting backend", "details": str(e)}), 502

        # 2. Parse JSON override from client (optional)
        client_payload = None
        if 'payload' in request.form:
            try:
                client_payload = json.loads(request.form['payload'])
            except Exception as e:
                return jsonify({"error": f"Invalid JSON in 'payload': {str(e)}"}), 400

        # 3. Merge backend data and client override (client overrides take precedence)
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

        # 4. Parse file uploads and encode as base64
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

        # 5. Prepare Gemini API request
        gemini_instruction = (
            "You are an API minimizer. Given the following input, return a minimized JSON object in this exact format, and ONLY this format (no extra text):\n"
            "{\n"
            "  'use_case': '<Same as input>',\n"
            "  'minimum_required_fields': [\n"
            "    '<List of fields AI determines are necessary for the use case (regardless of user consent)>'\n"
            "  ],\n"
            "  'fields_to_send': [\n"
            "    {\n"
            "      'field': '<field_name>',\n"
            "      'value': '<actual_value or <base64_encoded_data> for files>',\n"
            "      'reason': '<Why this field is being sent>',\n"
            "      'consent': true\n"
            "    }\n"
            "  ],\n"
            "  'excluded_fields': [\n"
            "    {\n"
            "      'field': '<field_name>',\n"
            "      'reason': '<Why this field is excluded: e.g., User Denied Consent or Not Required for Purpose>'\n"
            "    }\n"
            "  ]\n"
            "}\n"
            "Respond with only the minimized JSON, no explanations."
        )
        gemini_input = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": gemini_instruction + "\nInput:\n" + json.dumps(payload)
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
        return jsonify(gemini_json)
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 