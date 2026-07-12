import httpx

SUPPORTED_CURRENCIES = ["AOA", "USD", "EUR", "BRL", "CNY", "JPY", "ZAR", "NAD", "MZN", "CHF"]


def get_rates(base: str) -> dict:
    base = (base or "").upper()
    if base not in SUPPORTED_CURRENCIES:
        raise ValueError(f"Moeda base não suportada: {base}")

    try:
        response = httpx.get(f"https://open.er-api.com/v6/latest/{base}", timeout=10)
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPError as e:
        raise ValueError("Não foi possível obter as taxas de câmbio.") from e

    if data.get("result") != "success":
        raise ValueError("Não foi possível obter as taxas de câmbio.")

    all_rates = data.get("rates", {})
    rates = {code: all_rates[code] for code in SUPPORTED_CURRENCIES if code in all_rates}

    return {
        "base": base,
        "rates": rates,
        "updated_at": data.get("time_last_update_utc"),
    }
