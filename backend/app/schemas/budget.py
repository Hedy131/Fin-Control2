from pydantic import BaseModel
from typing import Optional
from datetime import date


class BudgetBase(BaseModel):
    category_id: int
    amount: float
    period_start: date


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = None
    period_start: Optional[date] = None


class BudgetOut(BudgetBase):
    id: int
    user_id: int
    period_end: Optional[date] = None
    spent: Optional[float] = None

    class Config:
        from_attributes = True
