from flask import Flask, jsonify, request
import platform
import uuid
import socket
import hashlib
import numpy as np
from sklearn.ensemble import IsolationForest
import threading
import requests
import time
from pynput import keyboard, mouse

app = Flask(__name__)

MODEL_FEATURES = 6 

NORMAL_DATA = np.array([
    [28.6139, 77.2090, 0.5, 0.5, 0.5, 0.5], 
    [19.0760, 72.8777, 0.6, 0.4, 0.5, 0.6], 
    [12.9716, 77.5946, 0.4, 0.6, 0.5, 0.4], 
    [13.0827, 80.2707, 0.5, 0.5, 0.6, 0.5], 
    [22.5726, 88.3639, 0.5, 0.5, 0.4, 0.5], 
    [28.7041, 77.1025, 0.5, 0.5, 0.5, 0.5],  
    [23.0225, 72.5714, 0.5, 0.5, 0.5, 0.5],  
    [26.9124, 75.7873, 0.5, 0.5, 0.5, 0.5],  
    [18.5204, 73.8567, 0.5, 0.5, 0.5, 0.5],  
    [17.3850, 78.4867, 0.5, 0.5, 0.5, 0.5],  
])
clf = IsolationForest(contamination=0.1, random_state=42)
clf.fit(NORMAL_DATA)
model_lock = threading.Lock()

APP_START_TIME = time.time()

activity_counts = {
    'key_count': 0,
    'mouse_click_count': 0,
    'mouse_move_count': 0
}
activity_lock = threading.Lock()

def on_press(key):
    with activity_lock:
        activity_counts['key_count'] += 1

def on_click(x, y, button, pressed):
    if pressed:
        with activity_lock:
            activity_counts['mouse_click_count'] += 1

def on_move(x, y):
    with activity_lock:
        activity_counts['mouse_move_count'] += 1

keyboard_listener = keyboard.Listener(on_press=on_press)
mouse_listener = mouse.Listener(on_click=on_click, on_move=on_move)
keyboard_listener.start()
mouse_listener.start()

def get_device_data():
    device_id = str(uuid.getnode())
    device_type = platform.system()
    device_model = platform.machine()
    try:
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
    except:
        ip_address = '127.0.0.1'
    user_agent = request.headers.get('User-Agent', 'Unknown')
    latitude, longitude = 0.0, 0.0
    try:
        geo_resp = requests.get(f'https://ipinfo.io/{ip_address}/json', timeout=2)
        if geo_resp.status_code == 200:
            loc = geo_resp.json().get('loc', None)
            if loc:
                latitude, longitude = map(float, loc.split(','))
    except Exception:
        latitude, longitude = 28.6139, 77.2090  
    location_hash = hashlib.sha256(f"{latitude},{longitude}".encode()).hexdigest()
    return {
        'deviceId': device_id,
        'deviceType': device_type,
        'deviceModel': device_model,
        'ipAddress': ip_address,
        'userAgent': user_agent,
        'latitude': latitude,
        'longitude': longitude,
        'locationHash': location_hash
    }

def get_behavioral_data_accum():
    with activity_lock:
        key_count = activity_counts['key_count']
        mouse_click_count = activity_counts['mouse_click_count']
        mouse_move_count = activity_counts['mouse_move_count']
    typing_pattern = min(key_count / 500.0, 1.0) if key_count > 0 else 0.5
    touch_pattern = min(mouse_click_count / 300.0, 1.0) if mouse_click_count > 0 else 0.5
    navigation_pattern = min(mouse_move_count / 2000.0, 1.0) if mouse_move_count > 0 else 0.5
    session_pattern = min((time.time() - APP_START_TIME) / 600.0, 1.0)  # 10 min = 1.0
    return {
        'typingPattern': typing_pattern,
        'touchPattern': touch_pattern,
        'navigationPattern': navigation_pattern,
        'sessionPattern': session_pattern
    }

def detect_anomaly(features):
    with model_lock:
        score = clf.decision_function([features])[0]
    anomaly_score = -score  
    if anomaly_score < 0.5:
        risk_level = 'LOW'
    elif anomaly_score < 1.0:
        risk_level = 'MEDIUM'
    elif anomaly_score < 1.5:
        risk_level = 'HIGH'
    else:
        risk_level = 'CRITICAL'
    return anomaly_score, risk_level

@app.route('/detect', methods=['POST'])
def detect():
    device_data = get_device_data()
    behavioral_data = get_behavioral_data_accum()
    features = [
        float(device_data['latitude']),
        float(device_data['longitude']),
        behavioral_data['typingPattern'],
        behavioral_data['touchPattern'],
        behavioral_data['navigationPattern'],
        behavioral_data['sessionPattern']
    ]
    anomaly_score, risk_level = detect_anomaly(features)
    risk_factors = []
    if risk_level in ['HIGH', 'CRITICAL']:
        risk_factors.append('Anomalous device/location/behavior detected')
    return jsonify({
        'riskLevel': risk_level,
        'anomalyScore': anomaly_score,
        'riskFactors': risk_factors,
        'deviceData': device_data,
        'behavioralData': behavioral_data
    })

if __name__ == '__main__':
    app.run(debug=True, port=9001) 