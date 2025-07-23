# AI Data Minimization Layer for Fintech

A Flask-based microservice that uses Google Gemini Pro to minimize data fields for fintech use-cases, protecting user privacy.

## Features
- Accepts POST requests with JSON body describing third-party use-case and requested data fields
- Uses Gemini Pro (via API key) to return only relevant data keys
- Logs suspicious/unnecessary fields for audit
- Reads Gemini API key from environment (.env)
- Async Gemini call for non-blocking Flask app

## API
### POST /api/minimize-fields
- Input: JSON with use-case, purpose, description, and data fields
- Output: JSON with minimized/approved data fields

## Example Input
```
{
  "Third-Party": {
    "Use-case": "Loan Verification",
    "Purpose": "To verify user's eligibility for loan approval",
    "Description": "A loan platform that checks creditworthiness and repayment capacity"
  },
  "data": {
    "Full Name": "datatype:text",
    "Email": "datatype:text",
    "Aadhaar Number": "datatype:text",
    "PAN Card": "datatype:text",
    "Bank Statement": "datatype:file",
    "Salary Slips": "datatype:file",
    "Social Media Profile": "datatype:text"
  }
}
```

## Example Output
```
{
  "fields": [
    "Full Name",
    "PAN Card",
    "Bank Statement",
    "Salary Slips"
  ]
}
```

## Structure
- controllers/
  - minimize_fields.py
- services/
  - gemini_client.py
  - validation.py
  - logger.py
- utils/
  - prompt_builder.py
  - masking.py (optional)

## Dependencies
- flask
- google-generativeai
- python-dotenv
- requests
- pydantic (optional)

## Docker
- Dockerfile for containerization
- Exposes port 5000
- Requires `GOOGLE_API_KEY` in .env

---
This README will be updated as the project evolves.
