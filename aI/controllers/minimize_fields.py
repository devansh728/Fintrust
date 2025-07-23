from flask import Blueprint, request, jsonify
from services.validation import validate_minimize_fields_input
from services.gemini_client import get_minimized_fields
from services.logger import log_suspicious_fields
from utils.masking import mask_field
from pydantic import BaseModel, ValidationError, model_validator
import logging
from middleware.token_validation import token_required

minimize_fields_bp = Blueprint('minimize_fields', __name__)
logger = logging.getLogger("minimize_fields")

class MinimizeFieldsRequest(BaseModel):
    Third_Party: dict
    data: dict

    @model_validator(mode="after")
    def check_fields(self):
        if not self.Third_Party or not self.data:
            raise ValueError("Missing 'Third-Party' or 'data' in request.")
        if not isinstance(self.data, dict):
            raise ValueError("'data' must be a dictionary.")
        return self

@minimize_fields_bp.route('/api/minimize-fields', methods=['POST'])
# @token_required
def minimize_fields():
    try:
        req_json = request.get_json()
        logger.info(f"Received request data: {req_json}")
        if not req_json:
            logger.warning("Empty request body received.")
            return jsonify({"error": "Request body cannot be empty"}), 400
        # Accept both 'Third-Party' and 'Third_Party' for flexibility
        if 'Third-Party' in req_json:
            req_json['Third_Party'] = req_json['Third-Party']
        validated = MinimizeFieldsRequest(**req_json)
    except (ValidationError, ValueError) as e:
        logger.warning(f"Validation error: {e}")
        return jsonify({"error": str(e)}), 400

    # Log the request for audit
    logger.info(f"Received minimize-fields request: {req_json}")

    # Mask sensitive fields before sending to Gemini
    masked_data = {k: mask_field(k, v) for k, v in validated.data.items()}
    gemini_input = {
        "Third-Party": validated.Third_Party,
        "data": masked_data
    }
    minimized, suspicious = get_minimized_fields(gemini_input)
    if suspicious:
        log_suspicious_fields(suspicious, req_json)
    return jsonify({"fields": minimized, "suspicious": suspicious})

@minimize_fields_bp.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})
