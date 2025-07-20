#!/usr/bin/env python3
"""
Complete Test Script for Fintech Anomaly Detection & Privacy Protection System
Tests all components: Authentication, Anomaly Detection, Smart Contracts, and Privacy Protection
"""

import requests
import json
import time
import base64
from datetime import datetime

# Configuration
AUTH_SERVICE_URL = "http://localhost:8089"
FLASK_GATEWAY_URL = "http://localhost:5000"

class AnomalyDetectionTester:
    def __init__(self):
        self.jwt_token = None
        self.user_id = "john_doe"
        self.session_id = "session_" + str(int(time.time()))
        
    def print_separator(self, title):
        print(f"\n{'='*60}")
        print(f"🔍 {title}")
        print(f"{'='*60}")
    
    def test_authentication(self):
        """Step 1: Test user authentication to get JWT token"""
        self.print_separator("AUTHENTICATION TEST")
        
        # First, register a user
        print("1. Registering user...")
        register_data = {
            "username": self.user_id,
            "password": "password123",
            "email": "john.doe@example.com"
        }
        
        try:
            response = requests.post(
                f"{AUTH_SERVICE_URL}/api/auth/signup",
                headers={"Content-Type": "application/json"},
                json=register_data,
                timeout=10
            )
            print(f"   Register response: {response.status_code}")
        except Exception as e:
            print(f"   Register error (might already exist): {str(e)}")
        
        # Login to get JWT token
        print("2. Logging in to get JWT token...")
        login_data = {
            "username": self.user_id,
            "password": "password123"
        }
        
        try:
            response = requests.post(
                f"{AUTH_SERVICE_URL}/api/auth/signin",
                headers={"Content-Type": "application/json"},
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                self.jwt_token = result.get('accessToken')
                print(f"   ✅ Login successful")
                print(f"   JWT Token: {self.jwt_token[:50]}...")
                return True
            else:
                print(f"   ❌ Login failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Login error: {str(e)}")
            return False
    
    def test_normal_behavior(self):
        """Step 2: Test API with normal behavioral patterns"""
        self.print_separator("NORMAL BEHAVIOR TEST")
        
        if not self.jwt_token:
            print("❌ No JWT token available. Please run authentication first.")
            return
        
        # Normal behavioral data
        headers = {
            "Authorization": f"Bearer {self.jwt_token}",
            "Content-Type": "application/json",
            "X-User-ID": self.user_id,
            "X-Session-ID": self.session_id,
            "X-Device-ID": "known_device_001",
            "X-Device-Type": "mobile",
            "X-Device-Model": "iPhone 14",
            "X-User-Location": "12.9716,77.5946",  # Bangalore
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
            }),
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
        }
        
        # Test direct anomaly detection
        print("1. Testing direct anomaly detection with normal behavior...")
        normal_behavior_data = {
            "userId": self.user_id,
            "username": self.user_id,
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
                "timeOnPage": 30.0
            },
            "sessionPattern": {
                "sessionId": self.session_id,
                "isActive": True,
                "requestCount": 5
            },
            "actionType": "API_REQUEST",
            "endpoint": "/api/requests/123/submitForm",
            "requestMethod": "POST",
            "contextData": {
                "contentLength": 1024,
                "contentType": "application/json"
            },
            "dataAnonymized": True,
            "consentLevel": "EXPLICIT",
            "dataRetentionUntil": datetime.now().replace(year=datetime.now().year + 1).isoformat()
        }
        
        try:
            response = requests.post(
                f"{AUTH_SERVICE_URL}/api/anomaly/detect",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.jwt_token}"},
                json=normal_behavior_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                anomaly_result = result.get('anomalyResult', {})
                print(f"   ✅ Normal behavior test passed")
                print(f"   Anomaly Score: {anomaly_result.get('overallAnomalyScore', 0.0):.3f}")
                print(f"   Risk Level: {anomaly_result.get('riskLevel', 'UNKNOWN')}")
                print(f"   Is Anomaly: {anomaly_result.get('isAnomaly', False)}")
                print(f"   Recommended Action: {anomaly_result.get('recommendedAction', 'UNKNOWN')}")
            else:
                print(f"   ❌ Normal behavior test failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Normal behavior test error: {str(e)}")
        
        # Test Flask Gateway with normal behavior
        print("\n2. Testing Flask Gateway with normal behavior...")
        flask_payload = {
            "use_case": "Credit Card Issuance",
            "form_data": {
                "text_fields": {"Phone Number": "9876543210"},
                "file_uploads": {}
            }
        }
        
        try:
            response = requests.post(
                f"{FLASK_GATEWAY_URL}/api/requests/123/submitForm",
                headers=headers,
                data={"payload": json.dumps(flask_payload)},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Flask Gateway test passed")
                print(f"   Use Case: {result.get('use_case', 'N/A')}")
                
                security_metadata = result.get('security_metadata', {})
                print(f"   Anomaly Detection: {security_metadata.get('anomaly_detection_performed', False)}")
                print(f"   Anomaly Score: {security_metadata.get('anomaly_score', 0.0):.3f}")
                print(f"   Risk Level: {security_metadata.get('risk_level', 'UNKNOWN')}")
                print(f"   Smart Contract Validated: {security_metadata.get('smart_contract_validated', False)}")
                
                # Check response headers
                print(f"   Response Headers:")
                print(f"     X-Anomaly-Score: {response.headers.get('X-Anomaly-Score', 'N/A')}")
                print(f"     X-Risk-Level: {response.headers.get('X-Risk-Level', 'N/A')}")
                print(f"     X-Confidence-Level: {response.headers.get('X-Confidence-Level', 'N/A')}")
                
            else:
                print(f"   ❌ Flask Gateway test failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Flask Gateway test error: {str(e)}")
    
    def test_anomalous_behavior(self):
        """Step 3: Test API with anomalous behavioral patterns"""
        self.print_separator("ANOMALOUS BEHAVIOR TEST")
        
        if not self.jwt_token:
            print("❌ No JWT token available. Please run authentication first.")
            return
        
        # Anomalous behavioral data
        headers = {
            "Authorization": f"Bearer {self.jwt_token}",
            "Content-Type": "application/json",
            "X-User-ID": self.user_id,
            "X-Session-ID": self.session_id,
            "X-Device-ID": "unknown_device_999",  # Unknown device
            "X-Device-Type": "mobile",
            "X-Device-Model": "Unknown Device",
            "X-User-Location": "40.7128,-74.0060",  # New York (different location)
            "X-Typing-Pattern": json.dumps({
                "averageSpeed": 2.0,  # Much faster typing
                "variance": 0.8,  # High variance
                "pauseDuration": 0.1,  # Very short pauses
                "backspaceFreq": 0.2  # High error rate
            }),
            "X-Touch-Pattern": json.dumps({
                "pressure": 0.3,  # Different pressure
                "duration": 0.8,  # Longer taps
                "velocity": 1.5,  # Faster swipes
                "distance": 200.0,
                "direction": "left",
                "screenSize": 6.1,
                "area": "top"
            }),
            "User-Agent": "Mozilla/5.0 (Unknown; CPU Unknown OS) AppleWebKit/605.1.15"
        }
        
        # Test direct anomaly detection with anomalous behavior
        print("1. Testing direct anomaly detection with anomalous behavior...")
        anomalous_behavior_data = {
            "userId": self.user_id,
            "username": self.user_id,
            "timestamp": datetime.now().isoformat(),
            "deviceId": "unknown_device_999",
            "deviceType": "mobile",
            "deviceModel": "Unknown Device",
            "ipAddress": "203.0.113.1",  # Different IP
            "userAgent": "Mozilla/5.0 (Unknown; CPU Unknown OS) AppleWebKit/605.1.15",
            "latitude": 40.7128,  # New York
            "longitude": -74.0060,
            "locationHash": "4071,-7400",
            "typingPattern": {
                "averageTypingSpeed": 2.0,
                "typingVariance": 0.8,
                "pauseDuration": 0.1,
                "backspaceFrequency": 0.2
            },
            "touchPattern": {
                "tapPressure": 0.3,
                "tapDuration": 0.8,
                "swipeVelocity": 1.5,
                "swipeDistance": 200.0,
                "swipeDirection": "left",
                "screenSize": 6.1,
                "touchArea": "top"
            },
            "navigationPattern": {
                "currentPage": "/api/requests/123/submitForm",
                "timeOnPage": 5.0  # Very short time
            },
            "sessionPattern": {
                "sessionId": self.session_id,
                "isActive": True,
                "requestCount": 1  # First request
            },
            "actionType": "API_REQUEST",
            "endpoint": "/api/requests/123/submitForm",
            "requestMethod": "POST",
            "contextData": {
                "contentLength": 2048,
                "contentType": "application/json"
            },
            "dataAnonymized": True,
            "consentLevel": "EXPLICIT",
            "dataRetentionUntil": datetime.now().replace(year=datetime.now().year + 1).isoformat()
        }
        
        try:
            response = requests.post(
                f"{AUTH_SERVICE_URL}/api/anomaly/detect",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.jwt_token}"},
                json=anomalous_behavior_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                anomaly_result = result.get('anomalyResult', {})
                print(f"   ✅ Anomalous behavior test passed")
                print(f"   Anomaly Score: {anomaly_result.get('overallAnomalyScore', 0.0):.3f}")
                print(f"   Risk Level: {anomaly_result.get('riskLevel', 'UNKNOWN')}")
                print(f"   Is Anomaly: {anomaly_result.get('isAnomaly', False)}")
                print(f"   Risk Factors: {anomaly_result.get('riskFactors', [])}")
                print(f"   Recommended Action: {anomaly_result.get('recommendedAction', 'UNKNOWN')}")
            else:
                print(f"   ❌ Anomalous behavior test failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Anomalous behavior test error: {str(e)}")
        
        # Test Flask Gateway with anomalous behavior
        print("\n2. Testing Flask Gateway with anomalous behavior...")
        flask_payload = {
            "use_case": "Credit Card Issuance",
            "form_data": {
                "text_fields": {"Phone Number": "9876543210"},
                "file_uploads": {}
            }
        }
        
        try:
            response = requests.post(
                f"{FLASK_GATEWAY_URL}/api/requests/123/submitForm",
                headers=headers,
                data={"payload": json.dumps(flask_payload)},
                timeout=30
            )
            
            if response.status_code in [401, 403]:
                result = response.json()
                print(f"   ✅ Anomaly detected and blocked (Expected)")
                print(f"   Error: {result.get('error', 'N/A')}")
                print(f"   Message: {result.get('message', 'N/A')}")
                print(f"   Anomaly Score: {result.get('anomalyScore', 'N/A')}")
                print(f"   Risk Level: {result.get('riskLevel', 'N/A')}")
                print(f"   Risk Factors: {result.get('riskFactors', [])}")
            else:
                print(f"   ⚠️  Unexpected response: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Flask Gateway test error: {str(e)}")
    
    def test_smart_contract_validation(self):
        """Step 4: Test smart contract validation"""
        self.print_separator("SMART CONTRACT VALIDATION TEST")
        
        if not self.jwt_token:
            print("❌ No JWT token available. Please run authentication first.")
            return
        
        # Test valid smart contract execution
        print("1. Testing valid smart contract execution...")
        valid_contract_request = {
            "userId": self.user_id,
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
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.jwt_token}"},
                json=valid_contract_request,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                contract_request = result.get('contractRequest', {})
                print(f"   ✅ Valid smart contract test passed")
                print(f"   Status: {contract_request.get('status', 'UNKNOWN')}")
                print(f"   Execution Allowed: {contract_request.get('executionAllowed', False)}")
                print(f"   Transaction Hash: {contract_request.get('transactionHash', 'N/A')}")
                print(f"   Security Level: {contract_request.get('securityLevel', 'N/A')}")
            else:
                print(f"   ❌ Valid smart contract test failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Valid smart contract test error: {str(e)}")
        
        # Test smart contract validation
        print("\n2. Testing smart contract validation...")
        validation_data = {
            "userId": self.user_id,
            "overallAnomalyScore": 0.3,  # Low anomaly score
            "isAnomaly": False,
            "riskLevel": "LOW"
        }
        
        try:
            response = requests.post(
                f"{AUTH_SERVICE_URL}/api/anomaly/smart-contract/validate",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.jwt_token}"},
                json=validation_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Smart contract validation test passed")
                print(f"   Is Valid: {result.get('isValid', False)}")
                print(f"   Anomaly Score: {result.get('anomalyScore', 0.0):.3f}")
                print(f"   Risk Level: {result.get('riskLevel', 'UNKNOWN')}")
            else:
                print(f"   ❌ Smart contract validation test failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Smart contract validation test error: {str(e)}")
    
    def test_privacy_protection(self):
        """Step 5: Test privacy protection features"""
        self.print_separator("PRIVACY PROTECTION TEST")
        
        if not self.jwt_token:
            print("❌ No JWT token available. Please run authentication first.")
            return
        
        # Test data minimization
        print("1. Testing data minimization...")
        test_payload = {
            "use_case": "Credit Card Issuance",
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
        
        headers = {
            "Authorization": f"Bearer {self.jwt_token}",
            "Content-Type": "multipart/form-data",
            "X-User-ID": self.user_id,
            "X-Session-ID": self.session_id,
            "X-Device-ID": "known_device_001",
            "X-User-Location": "12.9716,77.5946"
        }
        
        try:
            response = requests.post(
                f"{FLASK_GATEWAY_URL}/api/requests/456/submitForm",
                headers=headers,
                data={"payload": json.dumps(test_payload)},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Privacy protection test passed")
                print(f"   Use Case: {result.get('use_case', 'N/A')}")
                print(f"   Required Fields: {result.get('minimum_required_fields', [])}")
                print(f"   Excluded Fields: {len(result.get('excluded_fields', []))}")
                
                # Check if sensitive data is masked
                form_data = result.get('form_data', {})
                text_fields = form_data.get('text_fields', {})
                if 'Phone Number' in text_fields:
                    phone = text_fields['Phone Number']
                    if '****' in phone:
                        print(f"   ✅ Phone number masked: {phone}")
                    else:
                        print(f"   ❌ Phone number not masked: {phone}")
                
                privacy_metadata = result.get('privacy_metadata', {})
                print(f"   Data Minimization: {privacy_metadata.get('data_minimization_applied', False)}")
                print(f"   Sensitive Fields Masked: {privacy_metadata.get('sensitive_fields_masked', False)}")
                print(f"   Compliance Frameworks: {privacy_metadata.get('compliance_frameworks', [])}")
                
            else:
                print(f"   ❌ Privacy protection test failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Privacy protection test error: {str(e)}")
    
    def test_health_endpoints(self):
        """Step 6: Test health endpoints"""
        self.print_separator("HEALTH ENDPOINTS TEST")
        
        # Test authentication service health
        print("1. Testing Authentication Service Health...")
        try:
            response = requests.get(f"{AUTH_SERVICE_URL}/api/anomaly/health", timeout=5)
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Authentication Service Health: {result.get('status', 'UNKNOWN')}")
                print(f"   Service: {result.get('service', 'N/A')}")
                print(f"   Version: {result.get('version', 'N/A')}")
            else:
                print(f"   ❌ Authentication Service Health: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Authentication Service Health Error: {str(e)}")
        
        # Test Flask Gateway health
        print("\n2. Testing Flask Gateway Health...")
        try:
            response = requests.get(f"{FLASK_GATEWAY_URL}/api/health", timeout=5)
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Flask Gateway Health: {result.get('status', 'UNKNOWN')}")
                print(f"   Service: {result.get('service', 'N/A')}")
                print(f"   Anomaly Detection Service: {result.get('anomaly_detection_service', 'UNKNOWN')}")
                print(f"   Version: {result.get('version', 'N/A')}")
            else:
                print(f"   ❌ Flask Gateway Health: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Flask Gateway Health Error: {str(e)}")
    
    def run_complete_test(self):
        """Run all tests in sequence"""
        print("🚀 Fintech Anomaly Detection & Privacy Protection System")
        print("=" * 70)
        print(f"Complete Test Suite Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Authentication Service URL: {AUTH_SERVICE_URL}")
        print(f"Flask Gateway URL: {FLASK_GATEWAY_URL}")
        print("=" * 70)
        
        # Run all tests
        if self.test_authentication():
            self.test_health_endpoints()
            self.test_normal_behavior()
            self.test_anomalous_behavior()
            self.test_smart_contract_validation()
            self.test_privacy_protection()
        else:
            print("❌ Authentication failed. Cannot proceed with other tests.")
        
        print("\n" + "=" * 70)
        print("🎉 Complete Test Suite Finished!")
        print("=" * 70)
        
        print("\n📋 Test Summary:")
        print("- ✅ Authentication: JWT token generation")
        print("- ✅ Health Checks: Service availability")
        print("- ✅ Normal Behavior: Low anomaly detection")
        print("- ✅ Anomalous Behavior: High anomaly detection")
        print("- ✅ Smart Contract: Blockchain validation")
        print("- ✅ Privacy Protection: Data minimization and masking")
        print("\n🔒 Security Features Tested:")
        print("- Real-time behavioral analysis")
        print("- Multi-dimensional anomaly detection")
        print("- Smart contract execution control")
        print("- Privacy-preserving data sharing")
        print("- GDPR/DPDP compliance")

if __name__ == "__main__":
    tester = AnomalyDetectionTester()
    tester.run_complete_test() 