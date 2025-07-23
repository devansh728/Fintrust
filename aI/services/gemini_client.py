import os
import requests
import logging
from utils.prompt_builder import build_gemini_prompt
from dotenv import load_dotenv
from services.validation import detect_suspicious_fields

load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
logger = logging.getLogger("gemini_client")

def get_minimized_fields(data):
    prompt = build_gemini_prompt(data)
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    logger.info(f"Sending request to Gemini: {payload}")
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GEMINI_API_KEY
    }
    response = requests.post(GEMINI_API_URL, json=payload, headers=headers)
    logger.info(f"Gemini response status: {response.status_code}")
    import json
    try:
        result = response.json()
    except Exception as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        return [], []
    logger.info(f"Gemini response JSON: {result}")
    # Extract the text response from Gemini
    text = None
    try:
        candidates = result.get('candidates', [])
        if candidates:
            parts = candidates[0].get('content', {}).get('parts', [])
            if parts:
                text = parts[0].get('text', '')
    except Exception as e:
        logger.error(f"Failed to extract text from Gemini response: {e}")
        return [], []
    logger.info(f"Gemini response text: {text}")
    # Remove code block markers and parse JSON
    fields, suspicious = [], []
    if text:
        import re
        # Remove ```json ... ``` or ``` ... ```
        json_str = re.sub(r'^```json|^```|```$', '', text.strip(), flags=re.MULTILINE).strip()
        try:
            parsed = json.loads(json_str)
            fields = parsed.get('fields', [])
            suspicious = parsed.get('suspicious', [])
        except Exception as e:
            logger.error(f"Failed to parse fields/suspicious from Gemini text: {e}")
    logger.info(f"Parsed fields from Gemini response: {fields}")
    logger.info(f"Suspicious fields: {suspicious}")
    # Fallback: if fields is empty, mark all as suspicious
    if not fields:
        suspicious = list(data.get('data', {}).keys())
    return fields, suspicious
