from pydantic import BaseModel, model_validator
from typing import List, Optional
from datetime import date as date_type, datetime, time as time_of_day

from app.models.enums import TransactionType


class TransactionBase(BaseModel):
    account_id: int
    destination_account_id: Optional[int] = None
    category_id: Optional[int] = None
    type: TransactionType
    amount: float
    description: Optional[str] = None
    date: date_type
    time: Optional[time_of_day] = None

    @model_validator(mode="after")
    def check_transfer_fields(self):
        if self.type == TransactionType.transfer:
            if not self.destination_account_id:
                raise ValueError("destination_account_id é obrigatório para transferências")
            if self.destination_account_id == self.account_id:
                raise ValueError("destination_account_id deve ser diferente de account_id")
        elif self.destination_account_id is not None:
            raise ValueError("destination_account_id só é permitido para transferências")
        return self


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    account_id: Optional[int] = None
    destination_account_id: Optional[int] = None
    category_id: Optional[int] = None
    type: Optional[TransactionType] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date_type] = None
    time: Optional[time_of_day] = None


class TransactionOut(TransactionBase):
    id: int
    user_id: int
    destination_amount: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CurrencyTotals(BaseModel):
    currency: str
    income: float = 0
    expense: float = 0
    investment: float = 0
    transfer: float = 0
    savings: float = 0
    balance: float = 0


class TransactionsSummary(BaseModel):
    by_currency: List[CurrencyTotals]


class TransactionBulkDeleteRequest(BaseModel):
    ids: List[int]


class TransactionBulkDeleteResponse(BaseModel):
    deleted: int


class TransactionBulkUpdateRequest(BaseModel):
    ids: List[int]
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    type: Optional[TransactionType] = None


class TransactionBulkUpdateResponse(BaseModel):
    updated: int


class DuplicateTransactionGroup(BaseModel):
    account_id: int
    category_id: Optional[int] = None
    type: TransactionType
    amount: float
    description: Optional[str] = None
    date: date_type
    count: int
    transaction_ids: List[int]


class DuplicateTransactionsResponse(BaseModel):
    groups: List[DuplicateTransactionGroup]
