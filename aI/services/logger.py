import json
import logging

def log_suspicious_fields(suspicious, original_data):
    logging.warning(f"Suspicious fields detected: {suspicious} | Original: {original_data}")
    with open('suspicious_fields.log', 'a') as f:
        f.write(json.dumps({
            "suspicious": suspicious,
            "original": original_data
        }) + "\n")
