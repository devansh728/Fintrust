# (Optional) Masking utility for sensitive fields

def mask_field(field_name, value):
    if 'aadhaar' in field_name.lower():
        return 'XXXX-XXXX-' + str(value)[-4:]
    if 'pan' in field_name.lower():
        return str(value)[:4] + '*****'
    if 'phone' in field_name.lower():
        return '+91-XXX-XXX-' + str(value)[-4:]
    return value
