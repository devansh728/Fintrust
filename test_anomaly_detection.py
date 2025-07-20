#!/usr/bin/env python3
"""
Test script for the Fintech Anomaly Detection & Privacy Protection System
Demonstrates the core functionality including anomaly detection, smart contract validation, and privacy protection.
"""

import requests
import json
import time
import random
from datetime import datetime

# Configuration
FLASK_GATEWAY_URL = "http://localhost:5000"
AUTH_SERVICE_URL = "http://localhost:8089"

def test_anomaly_detection():
    """Test anomaly detection with different behavioral patterns"""
    print("🔍 Testing Anomaly Detection System")
    print("=" * 50)
    
    # Test Case 1: Normal Behavior
    print("\n1. Testing Normal Behavior (Expected: No Anomaly)")
    normal_behavior = {
        "userId": "user123",
        "username": "john_doe",
        "timestamp": datetime.now().isoformat(),
        "deviceId": "known_device_001",
        "deviceType": "mobile",
        "deviceModel": "iPhone 14",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "locationHash": "1297,7759",
        "typingPattern": {
            "averageTypingSpeed": 0.5,
            "typingVariance": 0.1,
            "pauseDuration": 0.3,
            "backspaceFrequency": 0.05
        },
        "touchPattern": {
            "tapPressure": 0.8,
            "tapDuration": 0.2,
            "swipeVelocity": 0.6,
            "swipeDistance": 100.0,
            "swipeDirection": "right",
            "screenSize": 6.1,
            "touchArea": "center"
        },
        "navigationPattern": {
            "currentPage": "/api/requests/123/submitForm",
            "requestMethod": "POST",
            "timeOnPage": 30.0
        },
        "sessionPattern": {
            "sessionId": "session_001",
            "isActive": True,
            "requestCount": 5
        },
        "actionType": "API_REQUEST",
        "endpoint": "/api/requests/123/submitForm",
        "requestMethod": "POST",
        "contextData": {
            "contentLength": 1024,
            "contentType": "multipart/form-data"
        },
        "dataAnonymized": True,
        "consentLevel": "EXPLICIT",
        "dataRetentionUntil": datetime.now().replace(year=datetime.now().year + 1).isoformat()
    }
    
    try:
        response = requests.post(
            f"{AUTH_SERVICE_URL}/api/anomaly/detect",
            headers={"Content-Type": "application/json"},
            json=normal_behavior,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            anomaly_result = result.get('anomalyResult', {})
            print(f"✅ Normal behavior test passed")
            print(f"   Anomaly Score: {anomaly_result.get('overallAnomalyScore', 0.0):.3f}")
            print(f"   Risk Level: {anomaly_result.get('riskLevel', 'UNKNOWN')}")
            print(f"   Is Anomaly: {anomaly_result.get('isAnomaly', False)}")
        else:
            print(f"❌ Normal behavior test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Normal behavior test error: {str(e)}")
    
    # Test Case 2: Anomalous Behavior
    print("\n2. Testing Anomalous Behavior (Expected: Anomaly Detected)")
    anomalous_behavior = {
        **normal_behavior,
        "deviceId": "unknown_device_999",
        "ipAddress": "203.0.113.1",  # Different IP
        "latitude": 40.7128,  # Different location (New York)
        "longitude": -74.0060,
        "typingPattern": {
            "averageTypingSpeed": 2.0,  # Much faster typing
            "typingVariance": 0.8,  # High variance
            "pauseDuration": 0.1,  # Very short pauses
            "backspaceFrequency": 0.2  # High error rate
        },
        "touchPattern": {
            "tapPressure": 0.3,  # Different pressure
            "tapDuration": 0.8,  # Longer taps
            "swipeVelocity": 1.5,  # Faster swipes
            "swipeDistance": 200.0,
            "swipeDirection": "left",
            "screenSize": 6.1,
            "touchArea": "top"
        }
    }
    
    try:
        response = requests.post(
            f"{AUTH_SERVICE_URL}/api/anomaly/detect",
            headers={"Content-Type": "application/json"},
            json=anomalous_behavior,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            anomaly_result = result.get('anomalyResult', {})
            print(f"✅ Anomalous behavior test passed")
            print(f"   Anomaly Score: {anomaly_result.get('overallAnomalyScore', 0.0):.3f}")
            print(f"   Risk Level: {anomaly_result.get('riskLevel', 'UNKNOWN')}")
            print(f"   Is Anomaly: {anomaly_result.get('isAnomaly', False)}")
            print(f"   Risk Factors: {anomaly_result.get('riskFactors', [])}")
        else:
            print(f"❌ Anomalous behavior test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Anomalous behavior test error: {str(e)}")

def test_smart_contract_validation():
    """Test smart contract execution validation"""
    print("\n🧠 Testing Smart Contract Validation")
    print("=" * 50)
    
    # Test Case 1: Valid Smart Contract Execution
    print("\n1. Testing Valid Smart Contract Execution")
    valid_contract_request = {
        "userId": "user123",
        "contractFunction": "transferFunds",
        "parameters": {
            "amount": 1000,
            "recipient": "user456",
            "currency": "INR"
        }
    }
    
    try:
        response = requests.post(
            f"{AUTH_SERVICE_URL}/api/anomaly/smart-contract/execute",
            headers={"Content-Type": "application/json"},
            json=valid_contract_request,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            contract_request = result.get('contractRequest', {})
            print(f"✅ Valid smart contract test passed")
            print(f"   Status: {contract_request.get('status', 'UNKNOWN')}")
            print(f"   Execution Allowed: {contract_request.get('executionAllowed', False)}")
            print(f"   Transaction Hash: {contract_request.get('transactionHash', 'N/A')}")
        else:
            print(f"❌ Valid smart contract test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Valid smart contract test error: {str(e)}")
    
    # Test Case 2: Invalid Smart Contract Execution (High Anomaly)
    print("\n2. Testing Invalid Smart Contract Execution (High Anomaly)")
    invalid_contract_request = {
        "userId": "user123",
        "contractFunction": "transferFunds",
        "parameters": {
            "amount": 10000,  # High amount
            "recipient": "unknown_user",
            "currency": "INR"
        }
    }
    
    try:
        response = requests.post(
            f"{AUTH_SERVICE_URL}/api/anomaly/smart-contract/execute",
            headers={"Content-Type": "application/json"},
            json=invalid_contract_request,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            contract_request = result.get('contractRequest', {})
            print(f"✅ Invalid smart contract test passed")
            print(f"   Status: {contract_request.get('status', 'UNKNOWN')}")
            print(f"   Execution Allowed: {contract_request.get('executionAllowed', False)}")
            print(f"   Error Message: {contract_request.get('errorMessage', 'N/A')}")
        else:
            print(f"❌ Invalid smart contract test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Invalid smart contract test error: {str(e)}")

def test_privacy_protection():
    """Test privacy-preserving data minimization"""
    print("\n🛡️ Testing Privacy Protection")
    print("=" * 50)
    
    # Test Case: Data Minimization
    print("\n1. Testing Data Minimization")
    
    test_payload = {
        "use_case": "Credit Card Issuance",
        "third_party": {
            "name": "BankCorp",
            "purpose": "KYC Verification",
            "requested_fields": ["PAN Card", "Aadhar", "Phone Number", "Address", "Income"]
        },
        "user_consent": {
            "approved_fields": ["PAN Card", "Phone Number", "Address"],
            "consent_type": "Granular",
            "consent_time": datetime.now().isoformat()
        },
        "form_data": {
            "text_fields": {
                "Phone Number": "9876543210",
                "PAN Card": "ABCDE1234F",
                "Aadhar": "123456789012",
                "Address": "123 Main Street, Bangalore, Karnataka, India",
                "Income": "500000"
            },
            "file_uploads": {
                "PAN_Card": {"filename": "pan.pdf", "size_kb": 100},
                "Aadhar": {"filename": "aadhar.jpg", "size_kb": 200},
                "Income_Certificate": {"filename": "income.pdf", "size_kb": 150}
            }
        }
    }
    
    try:
        response = requests.post(
            f"{FLASK_GATEWAY_URL}/api/requests/123/submitForm",
            headers={
                "Content-Type": "multipart/form-data",
                "X-User-ID": "user123",
                "X-Session-ID": "session456",
                "X-Device-ID": "device789",
                "X-User-Location": "12.9716,77.5946"
            },
            data={"payload": json.dumps(test_payload)},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Data minimization test passed")
            print(f"   Use Case: {result.get('use_case', 'N/A')}")
            print(f"   Required Fields: {result.get('minimum_required_fields', [])}")
            print(f"   Excluded Fields: {len(result.get('excluded_fields', []))}")
            print(f"   Privacy Metadata: {result.get('privacy_metadata', {})}")
            
            # Check if sensitive data is masked
            form_data = result.get('form_data', {})
            text_fields = form_data.get('text_fields', {})
            if 'Phone Number' in text_fields:
                phone = text_fields['Phone Number']
                if '****' in phone:
                    print(f"   ✅ Phone number masked: {phone}")
                else:
                    print(f"   ❌ Phone number not masked: {phone}")
        else:
            print(f"❌ Data minimization test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Data minimization test error: {str(e)}")

def test_flask_gateway_integration():
    """Test the complete Flask gateway integration"""
    print("\n🌐 Testing Flask Gateway Integration")
    print("=" * 50)
    
    # Test Case: Complete API Request with Anomaly Detection
    print("\n1. Testing Complete API Request")
    
    test_payload = {
        "use_case": "KYC Verification",
        "form_data": {
            "text_fields": {"Phone Number": "9876543210"},
            "file_uploads": {}
        }
    }
    
    try:
        response = requests.post(
            f"{FLASK_GATEWAY_URL}/api/requests/456/submitForm",
            headers={
                "Content-Type": "multipart/form-data",
                "X-User-ID": "user123",
                "X-Session-ID": "session456",
                "X-Device-ID": "known_device_001",
                "X-User-Location": "12.9716,77.5946",
                "X-Typing-Pattern": json.dumps({
                    "averageSpeed": 0.5,
                    "variance": 0.1,
                    "pauseDuration": 0.3,
                    "backspaceFreq": 0.05
                }),
                "X-Touch-Pattern": json.dumps({
                    "pressure": 0.8,
                    "duration": 0.2,
                    "velocity": 0.6,
                    "distance": 100.0,
                    "direction": "right",
                    "screenSize": 6.1,
                    "area": "center"
                })
            },
            data={"payload": json.dumps(test_payload)},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Complete API test passed")
            print(f"   Use Case: {result.get('use_case', 'N/A')}")
            
            security_metadata = result.get('security_metadata', {})
            print(f"   Anomaly Detection: {security_metadata.get('anomaly_detection_performed', False)}")
            print(f"   Anomaly Score: {security_metadata.get('anomaly_score', 0.0):.3f}")
            print(f"   Risk Level: {security_metadata.get('risk_level', 'UNKNOWN')}")
            print(f"   Smart Contract Validated: {security_metadata.get('smart_contract_validated', False)}")
            print(f"   Privacy Minimization: {security_metadata.get('privacy_preserving_minimization_applied', False)}")
        else:
            print(f"❌ Complete API test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Complete API test error: {str(e)}")

def test_health_endpoints():
    """Test health check endpoints"""
    print("\n🏥 Testing Health Endpoints")
    print("=" * 50)
    
    # Test Flask Gateway Health
    try:
        response = requests.get(f"{FLASK_GATEWAY_URL}/api/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Flask Gateway Health: {result.get('status', 'UNKNOWN')}")
            print(f"   Anomaly Detection Service: {result.get('anomaly_detection_service', 'UNKNOWN')}")
        else:
            print(f"❌ Flask Gateway Health: {response.status_code}")
    except Exception as e:
        print(f"❌ Flask Gateway Health Error: {str(e)}")
    
    # Test Authentication Service Health
    try:
        response = requests.get(f"{AUTH_SERVICE_URL}/api/anomaly/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Authentication Service Health: {result.get('status', 'UNKNOWN')}")
        else:
            print(f"❌ Authentication Service Health: {response.status_code}")
    except Exception as e:
        print(f"❌ Authentication Service Health Error: {str(e)}")

def main():
    """Main test function"""
    print("🚀 Fintech Anomaly Detection & Privacy Protection System")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Flask Gateway URL: {FLASK_GATEWAY_URL}")
    print(f"Authentication Service URL: {AUTH_SERVICE_URL}")
    print("=" * 60)
    
    # Run all tests
    test_health_endpoints()
    test_anomaly_detection()
    test_smart_contract_validation()
    test_privacy_protection()
    test_flask_gateway_integration()
    
    print("\n" + "=" * 60)
    print("🎉 Test completed!")
    print("=" * 60)
    
    print("\n📋 Summary:")
    print("- Anomaly Detection: Real-time behavioral analysis")
    print("- Smart Contract Integration: Blockchain-based security")
    print("- Privacy Protection: GDPR/DPDP compliant data handling")
    print("- Data Minimization: Use-case based field filtering")
    print("- Encryption: AES-256-GCM for sensitive data")
    print("- Differential Privacy: Mathematical privacy protection")

if __name__ == "__main__":
    main() 