from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.investment import InvestmentPosition
from app.models.category import Category
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.enums import TransactionType
from app.crud.period import Period, sum_transactions

ALL_TIME = Period(start=date.min, end=None)


def get_investment_positions(db: Session, user_id: int):
    """One position per investment-type category, auto-creating any that
    don't exist yet."""
    investment_categories = (
        db.query(Category)
        .filter(Category.user_id == user_id, Category.types.any(TransactionType.investment))
        .order_by(Category.name)
        .all()
    )
    existing = {
        p.category_id: p
        for p in db.query(InvestmentPosition).filter(InvestmentPosition.user_id == user_id).all()
    }

    result = []
    created = False
    for category in investment_categories:
        position = existing.get(category.id)
        if position is None:
            position = InvestmentPosition(user_id=user_id, category_id=category.id)
            db.add(position)
            created = True
        result.append(position)

    if created:
        db.commit()
        for p in result:
            db.refresh(p)
    return result


def get_investment_position(db: Session, user_id: int, position_id: int):
    return db.query(InvestmentPosition).filter(
        InvestmentPosition.id == position_id, InvestmentPosition.user_id == user_id
    ).first()


def compute_invested_amount(db: Session, user_id: int, category_id: int, initial_invested_amount: float) -> float:
    contributed = sum_transactions(db, user_id, TransactionType.investment, ALL_TIME, category_id=category_id)
    return round(initial_invested_amount + contributed, 2)


def compute_contributed_for_categories(db: Session, user_id: int, category_ids: list) -> dict:
    """all-time invested contributions per category_id in one grouped query."""
    if not category_ids:
        return {}
    rows = (
        db.query(Transaction.category_id, func.coalesce(func.sum(Transaction.amount), 0.0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.investment,
            Transaction.category_id.in_(category_ids),
        )
        .group_by(Transaction.category_id)
        .all()
    )
    return {category_id: round(amount or 0.0, 2) for category_id, amount in rows}


def compute_interest_for_categories(db: Session, user_id: int, category_ids: list) -> dict:
    """all-time interest/dividends paid (income-type transactions in the same
    investment category) per category_id, in one grouped query."""
    if not category_ids:
        return {}
    rows = (
        db.query(Transaction.category_id, func.coalesce(func.sum(Transaction.amount), 0.0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.income,
            Transaction.category_id.in_(category_ids),
        )
        .group_by(Transaction.category_id)
        .all()
    )
    return {category_id: round(amount or 0.0, 2) for category_id, amount in rows}


def resolve_currencies_for_categories(db: Session, user_id: int, category_ids: list) -> dict:
    """Currency of the account behind the most recent investment transaction,
    per category_id — one query, not one per position."""
    if not category_ids:
        return {}
    rows = (
        db.query(Transaction.category_id, Account.currency, Transaction.date, Transaction.id)
        .join(Account, Transaction.account_id == Account.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.investment,
            Transaction.category_id.in_(category_ids),
        )
        .order_by(Transaction.category_id, Transaction.date.desc(), Transaction.id.desc())
        .all()
    )
    result = {}
    for category_id, currency, _date, _id in rows:
        if category_id not in result:
            result[category_id] = currency.value if hasattr(currency, "value") else currency
    return result
