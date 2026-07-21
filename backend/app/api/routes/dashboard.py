from datetime import date
from typing import Literal

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
from app.crud.account import compute_balances_for_accounts
from app.crud.period import Period, get_last_n_periods, get_transactions_grouped_by_date, bucket_by_period
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
        [CurrencyBalance(currency=c, total=investment.get(c, 0.0)) for c in currencies],
        [CurrencyBalance(currency=c, total=savings.get(c, 0.0)) for c in currencies],
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
def get_summary(
    range: Literal["month", "last_month", "year"] = "month",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    balances = compute_balances_for_accounts(db, accounts)
    balances_by_currency: dict = {}
    for a in accounts:
        currency = a.currency.value if hasattr(a.currency, "value") else a.currency
        balances_by_currency[currency] = balances_by_currency.get(currency, 0.0) + balances.get(a.id, 0.0)
    total_balance_by_currency = [
        CurrencyBalance(currency=c, total=round(v, 2)) for c, v in balances_by_currency.items()
    ]

    periods = get_last_n_periods(db, current_user.id, n=6)
    current = periods[-1]
    today = date.today()

    if range == "last_month":
        target_period = periods[-2] if len(periods) >= 2 else periods[-1]
    elif range == "year":
        target_period = Period(start=date(today.year, 1, 1), end=None)
    else:
        target_period = current

    since = min(periods[0].start, target_period.start)

    income_grouped = get_transactions_grouped_by_date(db, current_user.id, TransactionType.income, since)
    expense_grouped = get_transactions_grouped_by_date(db, current_user.id, TransactionType.expense, since)
    investment_grouped = get_transactions_grouped_by_date(db, current_user.id, TransactionType.investment, since)
    savings_grouped = get_transactions_grouped_by_date(db, current_user.id, TransactionType.savings, since)
    cross_transfer_grouped = get_transactions_grouped_by_date(
        db, current_user.id, TransactionType.transfer, since, cross_currency_transfers_only=True
    )

    def balance_for(period):
        return _balance_rows(
            bucket_by_period(income_grouped, period),
            bucket_by_period(expense_grouped, period),
            bucket_by_period(investment_grouped, period),
            bucket_by_period(savings_grouped, period),
            bucket_by_period(cross_transfer_grouped, period),
        )

    (
        period_income_by_currency,
        period_expense_by_currency,
        period_investment_by_currency,
        period_savings_by_currency,
        period_balance_by_currency,
    ) = balance_for(target_period)

    expenses_by_category_query = (
        db.query(Category.id, Category.name, Category.color, func.coalesce(func.sum(Transaction.amount), 0.0))
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.expense,
            Transaction.date >= target_period.start,
        )
    )
    if target_period.end is not None:
        expenses_by_category_query = expenses_by_category_query.filter(Transaction.date <= target_period.end)
    expenses_by_category = [
        CategorySummary(category_id=r[0], category_name=r[1], color=r[2], total=round(r[3], 2))
        for r in expenses_by_category_query.group_by(Category.id).all()
    ]

    period_trend = []
    for p in periods:
        inc_by_currency, exp_by_currency, inv_by_currency, sav_by_currency, bal_by_currency = balance_for(p)
        period_trend.append(
            PeriodSummary(
                period_start=p.start,
                period_end=p.end,
                income_by_currency=inc_by_currency,
                expense_by_currency=exp_by_currency,
                investment_by_currency=inv_by_currency,
                savings_by_currency=sav_by_currency,
                balance_by_currency=bal_by_currency,
            )
        )

    return DashboardSummary(
        total_balance_by_currency=total_balance_by_currency,
        period_start=target_period.start,
        period_end=target_period.end,
        period_income_by_currency=period_income_by_currency,
        period_expense_by_currency=period_expense_by_currency,
        period_investment_by_currency=period_investment_by_currency,
        period_savings_by_currency=period_savings_by_currency,
        period_balance_by_currency=period_balance_by_currency,
        expenses_by_category=expenses_by_category,
        period_trend=period_trend,
    )
