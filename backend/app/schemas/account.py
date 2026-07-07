from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.account import AccountType


class AccountBase(BaseModel):
    name: str
    type: AccountType = AccountType.checking
    initial_balance: float = 0.0
    currency: str = "BRL"


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[AccountType] = None
    initial_balance: Optional[float] = None
    currency: Optional[str] = None


class AccountOut(AccountBase):
    id: int
    user_id: int
    created_at: datetime
    current_balance: Optional[float] = None

    class Config:
        from_attributes = True
