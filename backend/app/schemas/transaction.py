from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

from app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    type: TransactionType
    amount: float
    description: Optional[str] = None
    date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    type: Optional[TransactionType] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date] = None


class TransactionOut(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
