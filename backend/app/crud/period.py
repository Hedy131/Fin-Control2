from dataclasses import dataclass
from datetime import date, timedelta
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session, aliased

from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from app.models.enums import TransactionType


@dataclass(frozen=True)
class Period:
    start: date
    end: Optional[date]  # None = open-ended (ongoing) period


def _first_day_of_month(d: date) -> date:
    return d.replace(day=1)


def _last_day_of_month(d: date) -> date:
    next_month = d.replace(day=28) + timedelta(days=4)
    return next_month - timedelta(days=next_month.day)


def _month_add(d: date, months: int) -> date:
    """`d` shifted by `months`, keeping the same day-of-month (clamped to the target
    month's length, e.g. the 31st of a month shifted into February becomes the 28th/29th)."""
    total = d.month - 1 + months
    year = d.year + total // 12
    month = total % 12 + 1
    day = min(d.day, _last_day_of_month(date(year, month, 1)).day)
    return date(year, month, day)


def _salary_transaction_dates(db: Session, user_id: int) -> List[date]:
    """Distinct dates of income transactions tagged to an is_salary category, ascending."""
    rows = (
        db.query(Transaction.date)
        .join(Category, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.income,
            Category.is_salary.is_(True),
        )
        .distinct()
        .order_by(Transaction.date.asc())
        .all()
    )
    return [r[0] for r in rows]


def _calendar_periods(today: date, n: int) -> List[Period]:
    starts: List[date] = []
    cursor = _first_day_of_month(today)
    for _ in range(n):
        starts.append(cursor)
        cursor = _first_day_of_month(cursor - timedelta(days=1))
    starts.reverse()
    return [
        Period(start=start, end=None if i == len(starts) - 1 else _last_day_of_month(start))
        for i, start in enumerate(starts)
    ]


def _salary_periods(salary_dates: List[date]) -> List[Period]:
    periods: List[Period] = []
    for i, start in enumerate(salary_dates):
        end = salary_dates[i + 1] - timedelta(days=1) if i + 1 < len(salary_dates) else None
        periods.append(Period(start=start, end=end))
    return periods


def get_current_period(db: Session, user_id: int, today: Optional[date] = None) -> Period:
    """Financial period containing `today`. Falls back to the calendar month if the
    user has no salary-tagged transactions yet."""
    today = today or date.today()
    salary_dates = [d for d in _salary_transaction_dates(db, user_id) if d <= today]
    if not salary_dates:
        return Period(start=_first_day_of_month(today), end=None)
    return Period(start=salary_dates[-1], end=None)


def get_last_n_periods(db: Session, user_id: int, n: int = 6, today: Optional[date] = None) -> List[Period]:
    """Last n financial periods ending with the current (open-ended) one, oldest first.
    Periods before the first real salary transaction are extrapolated backward using the
    same day-of-month as that first transaction (e.g. if the first salary landed on the
    15th, earlier periods also run 15th-to-14th) — so "the month starts on salary day"
    holds for every period, not just the ones with an actual salary transaction tagged.
    Only falls back to plain calendar months when there is no salary date at all yet."""
    today = today or date.today()
    salary_dates = [d for d in _salary_transaction_dates(db, user_id) if d <= today]

    if not salary_dates:
        return _calendar_periods(today, n)

    real_periods = _salary_periods(salary_dates)
    if len(real_periods) >= n:
        return real_periods[-n:]

    missing = n - len(real_periods)
    first_start = real_periods[0].start
    pads: List[Period] = [
        Period(start=_month_add(first_start, -i), end=_month_add(first_start, -i + 1) - timedelta(days=1))
        for i in range(missing, 0, -1)
    ]
    return (pads + real_periods)[-n:]


def resolve_period_end(db: Session, user_id: int, period_start: date, today: Optional[date] = None) -> Optional[date]:
    """End date (inclusive) of the financial period starting at period_start, or None if
    ongoing. Looked up directly from get_last_n_periods (generous lookback) so it always
    matches exactly what was built there — a period_start coming from a periods dropdown
    can never resolve to a different boundary than what the user was shown."""
    today = today or date.today()
    for p in get_last_n_periods(db, user_id, n=120, today=today):
        if p.start == period_start:
            return p.end
    # Not among the known periods (very old pick, or a raw date not sourced from the
    # periods list) — best-effort calendar-month fallback.
    if period_start == _first_day_of_month(period_start):
        if _first_day_of_month(today) == period_start:
            return None
        return _last_day_of_month(period_start)
    return None


def sum_transactions(
    db: Session,
    user_id: int,
    type: TransactionType,
    period: Period,
    category_id: Optional[int] = None,
) -> float:
    query = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.user_id == user_id,
        Transaction.type == type,
        Transaction.date >= period.start,
    )
    if period.end is not None:
        query = query.filter(Transaction.date <= period.end)
    if category_id is not None:
        query = query.filter(Transaction.category_id == category_id)
    return round(query.scalar(), 2)


def sum_cross_currency_transfers_out(db: Session, user_id: int, period: Period) -> List[tuple]:
    """[(currency_code, total)] of the source-side amount for transfers that moved
    money into a different-currency account (destination_amount set), within a period."""
    query = (
        db.query(Account.currency, func.coalesce(func.sum(Transaction.amount), 0.0))
        .join(Account, Transaction.account_id == Account.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.transfer,
            Transaction.destination_amount.isnot(None),
            Transaction.date >= period.start,
        )
    )
    if period.end is not None:
        query = query.filter(Transaction.date <= period.end)
    rows = query.group_by(Account.currency).all()
    return [(c.value if hasattr(c, "value") else c, round(amount or 0.0, 2)) for c, amount in rows]


def sum_transactions_by_currency(db: Session, user_id: int, type: TransactionType, period: Period) -> List[tuple]:
    """[(currency_code, total)] for a transaction type within a period, grouped by the
    currency of the transaction's source account."""
    query = (
        db.query(Account.currency, func.coalesce(func.sum(Transaction.amount), 0.0))
        .join(Account, Transaction.account_id == Account.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == type,
            Transaction.date >= period.start,
        )
    )
    if period.end is not None:
        query = query.filter(Transaction.date <= period.end)
    rows = query.group_by(Account.currency).all()
    return [(c.value if hasattr(c, "value") else c, round(amount or 0.0, 2)) for c, amount in rows]


def get_transactions_grouped_by_date(
    db: Session, user_id: int, type: TransactionType, since: date, cross_currency_transfers_only: bool = False
) -> List[tuple]:
    """[(currency_code, date, total)] for a transaction type since `since`, grouped by
    source account currency and date — one query, bucketed into periods in Python
    afterwards instead of running one query per period."""
    query = (
        db.query(Account.currency, Transaction.date, func.coalesce(func.sum(Transaction.amount), 0.0))
        .join(Account, Transaction.account_id == Account.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == type,
            Transaction.date >= since,
        )
    )
    if cross_currency_transfers_only:
        query = query.filter(Transaction.destination_amount.isnot(None))
    rows = query.group_by(Account.currency, Transaction.date).all()
    return [(c.value if hasattr(c, "value") else c, d, round(amount or 0.0, 2)) for c, d, amount in rows]


def get_transfer_destination_rows(db: Session, user_id: int, since: date) -> List[tuple]:
    """[(currency_code, date, total)] for the destination side of ALL transfers since
    `since`, grouped by destination account currency and date. Uses destination_amount
    when set (cross-currency transfer), falling back to amount (same-currency transfer)."""
    dest_account = aliased(Account)
    query = (
        db.query(
            dest_account.currency,
            Transaction.date,
            func.coalesce(func.sum(func.coalesce(Transaction.destination_amount, Transaction.amount)), 0.0),
        )
        .join(dest_account, Transaction.destination_account_id == dest_account.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.transfer,
            Transaction.date >= since,
        )
        .group_by(dest_account.currency, Transaction.date)
    )
    rows = query.all()
    return [(c.value if hasattr(c, "value") else c, d, round(amount or 0.0, 2)) for c, d, amount in rows]


def bucket_by_period(grouped_rows: List[tuple], period: Period) -> List[tuple]:
    """Sum [(currency, date, amount)] rows falling inside `period` into [(currency, total)]."""
    totals: dict = {}
    for currency, d, amount in grouped_rows:
        if d < period.start:
            continue
        if period.end is not None and d > period.end:
            continue
        totals[currency] = totals.get(currency, 0.0) + amount
    return [(c, round(v, 2)) for c, v in totals.items()]
