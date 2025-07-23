from pydantic import BaseModel, ValidationError, model_validator

class MinimizeFieldsInput(BaseModel):
    Third_Party: dict
    data: dict

    @model_validator(mode="after")
    def check_fields(self):
        if not self.Third_Party or not self.data:
            raise ValueError("Missing 'Third-Party' or 'data' in request.")
        if not isinstance(self.data, dict):
            raise ValueError("'data' must be a dictionary.")
        return self

def validate_minimize_fields_input(data):
    try:
        if 'Third-Party' in data:
            data['Third_Party'] = data['Third-Party']
        MinimizeFieldsInput(**data)
        return True, None
    except (ValidationError, ValueError) as e:
        return False, str(e)

def detect_suspicious_fields(approved, requested):
    return [k for k in requested if k not in approved]
