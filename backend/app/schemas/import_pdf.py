from pydantic import BaseModel
from typing import List, Literal, Optional
from datetime import date

from app.models.enums import TransactionType


class ExtractedTransactionRow(BaseModel):
    """Shape Claude fills in via structured outputs."""

    date: str
    description: str
    amount: float
    type: Literal["income", "expense"]
    suggested_category: Optional[str] = None


class ExtractedStatement(BaseModel):
    transactions: List[ExtractedTransactionRow]


class ImportPreviewRow(BaseModel):
    date: date
    description: str
    amount: float
    type: TransactionType
    suggested_category_id: Optional[int] = None
    suggested_category_name: Optional[str] = None


class ImportPreviewResponse(BaseModel):
    rows: List[ImportPreviewRow]


class ImportConfirmRow(BaseModel):
    date: date
    description: Optional[str] = None
    amount: float
    type: TransactionType
    category_id: Optional[int] = None


class ImportConfirmRequest(BaseModel):
    account_id: int
    transactions: List[ImportConfirmRow]


class ImportConfirmResponse(BaseModel):
    created: int
