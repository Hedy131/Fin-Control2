from pydantic import BaseModel
from typing import Dict, Optional


class FxRatesResponse(BaseModel):
    base: str
    rates: Dict[str, float]
    updated_at: Optional[str] = None
