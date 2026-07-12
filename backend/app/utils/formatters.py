from datetime import datetime, date

def format_currency(amount: float, currency: str = "$") -> str:
    return f"{currency}{amount:,.2f}"

def format_date(value: date | datetime | None) -> str:
    if not value:
        return ""
    return value.strftime("%Y-%m-%d")

def format_license_plate(plate: str) -> str:
    return plate.strip().upper()
