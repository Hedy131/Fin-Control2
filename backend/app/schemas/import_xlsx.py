from pydantic import BaseModel
from typing import List, Optional
from datetime import date as date_type

from app.models.enums import TransactionType


class ImportPreviewRow(BaseModel):
    row_number: int
    valid: bool
    error: Optional[str] = None

    date: Optional[date_type] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[TransactionType] = None

    account_name: Optional[str] = None
    account_id: Optional[int] = None

    destination_account_name: Optional[str] = None
    destination_account_id: Optional[int] = None

    category_name: Optional[str] = None
    category_id: Optional[int] = None


class ImportPreviewResponse(BaseModel):
    rows: List[ImportPreviewRow]


class ImportConfirmRow(BaseModel):
    date: date_type
    description: Optional[str] = None
    amount: float
    type: TransactionType
    account_id: int
    destination_account_id: Optional[int] = None
    category_id: Optional[int] = None


class ImportConfirmRequest(BaseModel):
    transactions: List[ImportConfirmRow]


class ImportConfirmResponse(BaseModel):
    created: int
