from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

from app.models.currency import Currency


class GoalUpdate(BaseModel):
    target_amount: Optional[float] = None
    currency: Optional[Currency] = None
    target_date: Optional[date] = None
    linked_account_id: Optional[int] = None
    initial_amount: Optional[float] = None


class GoalOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    target_amount: float
    currency: Currency
    target_date: Optional[date] = None
    linked_account_id: Optional[int] = None
    initial_amount: float
    created_at: datetime
    progress: Optional[float] = None
    progress_pct: Optional[float] = None
    days_remaining: Optional[int] = None

    class Config:
        from_attributes = True
