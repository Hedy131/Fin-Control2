from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.currency import Currency


class InvestmentPositionUpdate(BaseModel):
    currency: Optional[Currency] = None
    current_value: Optional[float] = None


class InvestmentPositionOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    currency: Currency
    initial_invested_amount: float
    current_value: float
    created_at: datetime
    updated_at: datetime
    invested_amount: Optional[float] = None
    gain_loss: Optional[float] = None
    gain_loss_pct: Optional[float] = None

    class Config:
        from_attributes = True
