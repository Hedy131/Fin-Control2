from collections import defaultdict
from typing import Dict, Iterable, Tuple


def group_amounts_by_currency(rows: Iterable[Tuple[str, float]]) -> Dict[str, float]:
    totals: Dict[str, float] = defaultdict(float)
    for currency, amount in rows:
        totals[currency] += amount or 0.0
    return {currency: round(total, 2) for currency, total in totals.items()}
