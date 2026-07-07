from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.schemas.dashboard import DashboardSummary, CategorySummary, MonthlySummary
from app.crud.account import compute_balance

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()

    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    total_balance = round(sum(compute_balance(db, a) for a in accounts), 2)

    month_income = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.income,
        extract("month", Transaction.date) == today.month,
        extract("year", Transaction.date) == today.year,
    ).scalar()

    month_expense = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.expense,
        extract("month", Transaction.date) == today.month,
        extract("year", Transaction.date) == today.year,
    ).scalar()

    expenses_by_category_rows = (
        db.query(Category.id, Category.name, Category.color, func.coalesce(func.sum(Transaction.amount), 0.0))
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.expense,
            extract("month", Transaction.date) == today.month,
            extract("year", Transaction.date) == today.year,
        )
        .group_by(Category.id)
        .all()
    )
    expenses_by_category = [
        CategorySummary(category_id=r[0], category_name=r[1], color=r[2], total=round(r[3], 2))
        for r in expenses_by_category_rows
    ]

    monthly_trend = []
    for i in range(5, -1, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        inc = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.income,
            extract("month", Transaction.date) == m,
            extract("year", Transaction.date) == y,
        ).scalar()
        exp = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.expense,
            extract("month", Transaction.date) == m,
            extract("year", Transaction.date) == y,
        ).scalar()
        monthly_trend.append(
            MonthlySummary(month=m, year=y, income=round(inc, 2), expense=round(exp, 2), balance=round(inc - exp, 2))
        )

    return DashboardSummary(
        total_balance=total_balance,
        month_income=round(month_income, 2),
        month_expense=round(month_expense, 2),
        month_balance=round(month_income - month_expense, 2),
        expenses_by_category=expenses_by_category,
        monthly_trend=monthly_trend,
    )
