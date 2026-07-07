from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

from app.models.currency import Currency


class GoalBase(BaseModel):
    name: str
    target_amount: float
    currency: Currency = Currency.AOA
    target_date: Optional[date] = None
    linked_account_id: Optional[int] = None
    manual_current_amount: Optional[float] = None
    color: str = "#6366f1"


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    currency: Optional[Currency] = None
    target_date: Optional[date] = None
    linked_account_id: Optional[int] = None
    manual_current_amount: Optional[float] = None
    color: Optional[str] = None


class GoalOut(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    progress: Optional[float] = None
    progress_pct: Optional[float] = None
    days_remaining: Optional[int] = None

    class Config:
        from_attributes = True
