import os
import requests
from flask import request, jsonify
from functools import wraps
from dotenv import load_dotenv

load_dotenv()
AUTH_MICROSERVICE_URL = os.getenv("AUTH_MICROSERVICE_URL", "http://localhost:8080/api/auth/validate-token")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401
        token = auth_header.split(' ')[1]
        # Validate token with Auth microservice
        try:
            resp = requests.post(AUTH_MICROSERVICE_URL, json={'token': token}, timeout=3)
            if resp.status_code != 200:
                return jsonify({'error': 'Invalid or expired token'}), 401
        except Exception as e:
            return jsonify({'error': f'Auth service unreachable: {str(e)}'}), 503
        return f(*args, **kwargs)
    return decorated
