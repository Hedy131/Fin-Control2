from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    color: str
    total: float


class CurrencyBalance(BaseModel):
    currency: str
    total: float


class PeriodSummary(BaseModel):
    period_start: date
    period_end: Optional[date] = None
    income_by_currency: List[CurrencyBalance]
    expense_by_currency: List[CurrencyBalance]
    investment_by_currency: List[CurrencyBalance] = []
    savings_by_currency: List[CurrencyBalance] = []
    balance_by_currency: List[CurrencyBalance]


class DashboardSummary(BaseModel):
    total_balance_by_currency: List[CurrencyBalance]
    period_start: date
    period_end: Optional[date] = None
    period_income_by_currency: List[CurrencyBalance]
    period_expense_by_currency: List[CurrencyBalance]
    period_investment_by_currency: List[CurrencyBalance] = []
    period_savings_by_currency: List[CurrencyBalance] = []
    period_balance_by_currency: List[CurrencyBalance]
    expenses_by_category: List[CategorySummary]
    period_trend: List[PeriodSummary]
