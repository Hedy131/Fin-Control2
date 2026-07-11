from pydantic import BaseModel
from typing import Optional
from datetime import date


class BudgetUpdate(BaseModel):
    amount: float


class BudgetOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    amount: float
    period_start: date
    period_end: Optional[date] = None
    spent: Optional[float] = None

    class Config:
        from_attributes = True
