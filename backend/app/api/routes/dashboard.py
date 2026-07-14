from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.enums import TransactionType
from app.models.category import Category
from app.schemas.dashboard import DashboardSummary, CategorySummary, CurrencyBalance, PeriodSummary
from app.crud.account import compute_balance
from app.crud.period import (
    get_current_period,
    get_last_n_periods,
    sum_transactions_by_currency,
    sum_cross_currency_transfers_out,
)
from app.crud.aggregates import group_amounts_by_currency

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _balance_rows(income_rows, expense_rows, investment_rows, savings_rows, cross_currency_transfer_rows):
    income = group_amounts_by_currency(income_rows)
    expense = group_amounts_by_currency(expense_rows)
    investment = group_amounts_by_currency(investment_rows)
    savings = group_amounts_by_currency(savings_rows)
    transfer_out = group_amounts_by_currency(cross_currency_transfer_rows)
    currencies = set(income) | set(expense) | set(investment) | set(savings) | set(transfer_out)
    return (
        [CurrencyBalance(currency=c, total=income.get(c, 0.0)) for c in currencies],
        [CurrencyBalance(currency=c, total=expense.get(c, 0.0)) for c in currencies],
        [
            CurrencyBalance(
                currency=c,
                total=round(
                    income.get(c, 0.0)
                    - expense.get(c, 0.0)
                    - investment.get(c, 0.0)
                    - savings.get(c, 0.0)
                    - transfer_out.get(c, 0.0),
                    2,
                ),
            )
            for c in currencies
        ],
    )


@router.get("/summary", response_model=DashboardSummary)
def get_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    balances_by_currency: dict = {}
    for a in accounts:
        currency = a.currency.value if hasattr(a.currency, "value") else a.currency
        balances_by_currency[currency] = balances_by_currency.get(currency, 0.0) + compute_balance(db, a)
    total_balance_by_currency = [
        CurrencyBalance(currency=c, total=round(v, 2)) for c, v in balances_by_currency.items()
    ]

    current = get_current_period(db, current_user.id)
    income_rows = sum_transactions_by_currency(db, current_user.id, TransactionType.income, current)
    expense_rows = sum_transactions_by_currency(db, current_user.id, TransactionType.expense, current)
    investment_rows = sum_transactions_by_currency(db, current_user.id, TransactionType.investment, current)
    savings_rows = sum_transactions_by_currency(db, current_user.id, TransactionType.savings, current)
    cross_transfer_rows = sum_cross_currency_transfers_out(db, current_user.id, current)
    period_income_by_currency, period_expense_by_currency, period_balance_by_currency = _balance_rows(
        income_rows, expense_rows, investment_rows, savings_rows, cross_transfer_rows
    )

    expenses_by_category_query = (
        db.query(Category.id, Category.name, Category.color, func.coalesce(func.sum(Transaction.amount), 0.0))
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.expense,
            Transaction.date >= current.start,
        )
    )
    if current.end is not None:
        expenses_by_category_query = expenses_by_category_query.filter(Transaction.date <= current.end)
    expenses_by_category = [
        CategorySummary(category_id=r[0], category_name=r[1], color=r[2], total=round(r[3], 2))
        for r in expenses_by_category_query.group_by(Category.id).all()
    ]

    period_trend = []
    for p in get_last_n_periods(db, current_user.id, n=6):
        inc_rows = sum_transactions_by_currency(db, current_user.id, TransactionType.income, p)
        exp_rows = sum_transactions_by_currency(db, current_user.id, TransactionType.expense, p)
        inv_rows = sum_transactions_by_currency(db, current_user.id, TransactionType.investment, p)
        sav_rows = sum_transactions_by_currency(db, current_user.id, TransactionType.savings, p)
        cross_rows = sum_cross_currency_transfers_out(db, current_user.id, p)
        inc_by_currency, exp_by_currency, bal_by_currency = _balance_rows(
            inc_rows, exp_rows, inv_rows, sav_rows, cross_rows
        )
        period_trend.append(
            PeriodSummary(
                period_start=p.start,
                period_end=p.end,
                income_by_currency=inc_by_currency,
                expense_by_currency=exp_by_currency,
                balance_by_currency=bal_by_currency,
            )
        )

    return DashboardSummary(
        total_balance_by_currency=total_balance_by_currency,
        period_start=current.start,
        period_end=current.end,
        period_income_by_currency=period_income_by_currency,
        period_expense_by_currency=period_expense_by_currency,
        period_balance_by_currency=period_balance_by_currency,
        expenses_by_category=expenses_by_category,
        period_trend=period_trend,
    )
