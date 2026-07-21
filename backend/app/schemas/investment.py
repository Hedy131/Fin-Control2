from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.currency import Currency


class InvestmentPositionOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    currency: Currency
    initial_invested_amount: float
    created_at: datetime
    updated_at: datetime
    invested_amount: Optional[float] = None
    interest_paid: Optional[float] = None

    class Config:
        from_attributes = True
