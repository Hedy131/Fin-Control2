from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.investment import InvestmentType
from app.models.currency import Currency


class InvestmentPositionBase(BaseModel):
    name: str
    type: InvestmentType = InvestmentType.outro
    currency: Currency = Currency.AOA
    invested_amount: float = 0.0
    current_value: float = 0.0
    notes: Optional[str] = None


class InvestmentPositionCreate(InvestmentPositionBase):
    pass


class InvestmentPositionUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[InvestmentType] = None
    currency: Optional[Currency] = None
    invested_amount: Optional[float] = None
    current_value: Optional[float] = None
    notes: Optional[str] = None


class InvestmentPositionOut(InvestmentPositionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    gain_loss: Optional[float] = None
    gain_loss_pct: Optional[float] = None

    class Config:
        from_attributes = True
