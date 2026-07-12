import re

def validate_vin(vin: str) -> bool:
    # Standard VIN length is 17 alphanumeric characters (excluding I, O, Q)
    vin_clean = vin.strip().upper()
    if len(vin_clean) != 17:
        return False
    if not re.match("^[A-HJ-NPR-Z0-9]{17}$", vin_clean):
        return False
    return True

def validate_phone(phone: str) -> bool:
    # Basic check for phone format
    return bool(re.match(r"^\+?1?\d{9,15}$", phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")))
