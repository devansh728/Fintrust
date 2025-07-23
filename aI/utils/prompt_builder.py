def build_gemini_prompt(data):
    third_party = data.get("Third-Party", {})
    use_case = third_party.get("Use-case", "")
    purpose = third_party.get("Purpose", "")
    description = third_party.get("Description", "")
    requested_fields = list(data.get("data", {}).keys())
    prompt = f"""
You are an expert in Indian fintech compliance and privacy. Your job is to minimize user data exposure for third-party KYC (Know Your Customer) and other financial data requests.

Context:
- Use-case: {use_case}
- Purpose: {purpose}
- Description: {description}
- Regulation: DPDP, India

The third party is requesting the following user data fields: {requested_fields}

Instructions:
1. Only include fields that are strictly required for the stated use-case and Indian regulations.
2. Exclude any fields that are not necessary for the stated use-case and regulation.
3. If any field seems suspicious, unnecessary, or privacy-violating, list it under a 'suspicious' key.
4. For any Aadhar KYC or identity verification use-case, always include the Aadhar number (or Aadhaar Number, Aadhar-Card-Number, etc.) in the fields list if it is present in the request. Never mark the Aadhar number as suspicious for KYC or Aadhar verification use-cases.
5. Respond ONLY as a JSON object: {{"fields": [ ... ], "suspicious": [ ... ]}}

Here are some real-world examples to guide your decision:

Example 0:
Request: Aadhar KYC Verification
Fields: ["name", "email", "ssn", "Atm Pin", "Aadhar-Card-Number"]
Response: {{
  "fields": ["Aadhar-Card-Number", "name"],
  "suspicious": ["email", "ssn", "Atm Pin"]
}}

Example 1:
Request: Loan Application Verification
Fields: ["PAN Card", "Aadhaar Number", "Bank Statement", "Salary Slip", "Credit Score Report", "Social Media Profile"]
Response: {{
  "fields": ["PAN Card", "Aadhaar Number", "Bank Statement", "Salary Slip", "Credit Score Report"],
  "suspicious": ["Social Media Profile"]
}}

Example 2:
Request: KYC & Identity Verification
Fields: ["Aadhaar Number", "PAN Card", "Address Proof", "Face Photograph", "Phone Number", "Email"]
Response: {{
  "fields": ["Aadhaar Number", "PAN Card", "Address Proof", "Face Photograph"],
  "suspicious": ["Phone Number", "Email"]
}}

Example 3:
Request: Credit Score Assessment
Fields: ["PAN Card", "Loan History", "Credit Card Statements", "Aadhaar Number"]
Response: {{
  "fields": ["PAN Card", "Loan History", "Credit Card Statements", "Aadhaar Number"],
  "suspicious": []
}}

Example 4:
Request: Insurance Policy Underwriting
Fields: ["Aadhaar Number", "PAN Card", "Age", "Occupation", "Health Report", "Bank Account Details"]
Response: {{
  "fields": ["Aadhaar Number", "PAN Card", "Age", "Occupation", "Health Report"],
  "suspicious": ["Bank Account Details"]
}}

Example 5:
Request: Investment Risk Profiling
Fields: ["PAN Card", "Annual Income Proof", "Investment History", "Aadhaar Number", "Phone Number"]
Response: {{
  "fields": ["PAN Card", "Annual Income Proof", "Investment History", "Aadhaar Number"],
  "suspicious": ["Phone Number"]
}}

Example 6:
Request: Government Subsidy Claim Validation
Fields: ["Aadhaar Number", "Income Certificate", "Bank Account Details", "Phone Number", "Ration Card"]
Response: {{
  "fields": ["Aadhaar Number", "Income Certificate", "Ration Card"],
  "suspicious": ["Bank Account Details", "Phone Number"]
}}

Example 7:
Request: Buy Now Pay Later (BNPL) Setup
Fields: ["PAN Card", "Aadhaar Number", "Phone Number", "Bank Account Details", "Email"]
Response: {{
  "fields": ["PAN Card", "Aadhaar Number"],
  "suspicious": ["Phone Number", "Bank Account Details", "Email"]
}}

Example 8:
Request: Salary-based Personal Loan Approval
Fields: ["PAN Card", "Salary Slip", "Employer Name", "Bank Statement", "Email"]
Response: {{
  "fields": ["PAN Card", "Salary Slip", "Employer Name", "Bank Statement"],
  "suspicious": ["Email"]
}}

Example 9:
Request: Tax Filing Automation
Fields: ["PAN Card", "Form 16", "Salary Slip", "Investment Proof", "Email"]
Response: {{
  "fields": ["PAN Card", "Form 16", "Salary Slip", "Investment Proof"],
  "suspicious": ["Email"]
}}

Example 10:
Request: Fraud Monitoring & Transaction Audit
Fields: ["Transaction History", "Aadhaar Number", "Device Metadata", "Phone Number", "Bank Account Details"]
Response: {{
  "fields": ["Transaction History", "Aadhaar Number", "Device Metadata"],
  "suspicious": ["Phone Number", "Bank Account Details"]
}}

Use these examples to generalize and make the best privacy-preserving decision for any new use-case.
"""
    return prompt
