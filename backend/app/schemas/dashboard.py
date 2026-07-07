from pydantic import BaseModel
from typing import List


class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    color: str
    total: float


class MonthlySummary(BaseModel):
    month: int
    year: int
    income: float
    expense: float
    balance: float


class DashboardSummary(BaseModel):
    total_balance: float
    month_income: float
    month_expense: float
    month_balance: float
    expenses_by_category: List[CategorySummary]
    monthly_trend: List[MonthlySummary]
