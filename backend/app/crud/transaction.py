from datetime import date, datetime
from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from app.models.enums import TransactionType
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def validate_transaction_category(db: Session, category_id: Optional[int], type: TransactionType) -> None:
    if category_id is None:
        return
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is not None and type not in (category.types or []):
        raise ValueError("O tipo da transação não é válido para a categoria selecionada")


def _validate_transfer_fields(effective_type, effective_account_id, effective_destination_id) -> None:
    if effective_type == TransactionType.transfer:
        if not effective_destination_id:
            raise ValueError("destination_account_id é obrigatório para transferências")
        if effective_destination_id == effective_account_id:
            raise ValueError("destination_account_id deve ser diferente de account_id")
    elif effective_destination_id is not None:
        raise ValueError("destination_account_id só é permitido para transferências")


def _build_filtered_query(
    db: Session,
    user_id: int,
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if account_id:
        query = query.filter(
            or_(Transaction.account_id == account_id, Transaction.destination_account_id == account_id)
        )
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if type:
        query = query.filter(Transaction.type == type)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    return query


def get_transactions(
    db: Session,
    user_id: int,
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
):
    query = _build_filtered_query(db, user_id, account_id, category_id, type, search, start_date, end_date)
    return (
        query.order_by(Transaction.date.desc(), Transaction.time.desc().nullslast(), Transaction.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_transactions_summary(
    db: Session,
    user_id: int,
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    query = _build_filtered_query(db, user_id, account_id, category_id, type, search, start_date, end_date)
    rows = (
        query.join(Account, Transaction.account_id == Account.id)
        .with_entities(Account.currency, Transaction.type, func.coalesce(func.sum(Transaction.amount), 0.0))
        .group_by(Account.currency, Transaction.type)
        .all()
    )
    totals: dict = {}
    for currency, ttype, amount in rows:
        currency_key = currency.value if hasattr(currency, "value") else currency
        type_key = ttype.value if hasattr(ttype, "value") else ttype
        bucket = totals.setdefault(
            currency_key,
            {"income": 0.0, "expense": 0.0, "investment": 0.0, "transfer": 0.0, "savings": 0.0},
        )
        bucket[type_key] = bucket.get(type_key, 0.0) + (amount or 0.0)

    result = []
    for currency_key, bucket in totals.items():
        result.append(
            {
                "currency": currency_key,
                "income": round(bucket["income"], 2),
                "expense": round(bucket["expense"], 2),
                "investment": round(bucket["investment"], 2),
                "transfer": round(bucket["transfer"], 2),
                "savings": round(bucket["savings"], 2),
                "balance": round(bucket["income"] - bucket["expense"], 2),
            }
        )
    return result


def get_transaction(db: Session, user_id: int, transaction_id: int):
    return db.query(Transaction).filter(
        Transaction.id == transaction_id, Transaction.user_id == user_id
    ).first()


def create_transaction(db: Session, user_id: int, transaction_in: TransactionCreate) -> Transaction:
    validate_transaction_category(db, transaction_in.category_id, transaction_in.type)
    data = transaction_in.model_dump()
    if data.get("time") is None:
        data["time"] = datetime.now().time()
    transaction = Transaction(user_id=user_id, **data)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(db: Session, transaction: Transaction, transaction_in: TransactionUpdate):
    updates = transaction_in.model_dump(exclude_unset=True)

    effective_type = updates.get("type", transaction.type)
    effective_category_id = updates["category_id"] if "category_id" in updates else transaction.category_id
    effective_account_id = updates["account_id"] if "account_id" in updates else transaction.account_id
    effective_destination_id = (
        updates["destination_account_id"] if "destination_account_id" in updates else transaction.destination_account_id
    )

    validate_transaction_category(db, effective_category_id, effective_type)
    _validate_transfer_fields(effective_type, effective_account_id, effective_destination_id)

    for field, value in updates.items():
        setattr(transaction, field, value)
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction: Transaction):
    db.delete(transaction)
    db.commit()


def delete_transactions(db: Session, user_id: int, ids: list[int]) -> int:
    if not ids:
        return 0
    query = db.query(Transaction).filter(Transaction.user_id == user_id, Transaction.id.in_(ids))
    count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    return count


def bulk_update_transactions(db: Session, user_id: int, ids: list[int], updates: dict) -> int:
    if not ids or not updates:
        return 0
    transactions = (
        db.query(Transaction).filter(Transaction.user_id == user_id, Transaction.id.in_(ids)).all()
    )
    for transaction in transactions:
        for field, value in updates.items():
            setattr(transaction, field, value)
        effective_type = updates.get("type", transaction.type)
        if transaction.category_id is not None:
            category = db.query(Category).filter(Category.id == transaction.category_id).first()
            if category is not None and effective_type not in (category.types or []):
                transaction.category_id = None
    db.commit()
    return len(transactions)
