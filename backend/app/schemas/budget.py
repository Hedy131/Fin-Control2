from pydantic import BaseModel
from typing import Optional


class BudgetBase(BaseModel):
    category_id: int
    amount: float
    month: int
    year: int


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    amount: Optional[float] = None
    month: Optional[int] = None
    year: Optional[int] = None


class BudgetOut(BudgetBase):
    id: int
    user_id: int
    spent: Optional[float] = None

    class Config:
        from_attributes = True
