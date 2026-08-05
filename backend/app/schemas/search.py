from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class TransactionResult(BaseModel):
    id: int
    description: Optional[str] = None
    date: date
    amount: float
    currency: str
    category_id: Optional[int] = None


class AccountResult(BaseModel):
    id: int
    name: str
    currency: str


class CategoryResult(BaseModel):
    category_id: int
    name: str
    color: str


class SearchResults(BaseModel):
    transactions: List[TransactionResult] = []
    accounts: List[AccountResult] = []
    budgets: List[CategoryResult] = []
    investments: List[CategoryResult] = []
    goals: List[CategoryResult] = []
