from datetime import date, datetime
from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from app.models.enums import TransactionType
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services import fx


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


def _resolve_destination_amount(
    db: Session, account_id: Optional[int], destination_account_id: Optional[int], amount: float, type: TransactionType
) -> Optional[float]:
    """Para transferências entre contas de moedas diferentes, converte o valor
    à taxa de câmbio atual (via API) para gravar quanto a conta destino recebe."""
    if type != TransactionType.transfer or not destination_account_id:
        return None
    source = db.query(Account).filter(Account.id == account_id).first()
    destination = db.query(Account).filter(Account.id == destination_account_id).first()
    if source is None or destination is None:
        return None
    source_currency = source.currency.value if hasattr(source.currency, "value") else source.currency
    dest_currency = destination.currency.value if hasattr(destination.currency, "value") else destination.currency
    if source_currency == dest_currency:
        return None
    rates = fx.get_rates(source_currency)
    rate = rates["rates"].get(dest_currency)
    if rate is None:
        raise ValueError(f"Taxa de câmbio indisponível para {source_currency} -> {dest_currency}")
    return round(amount * rate, 2)


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


def get_transactions_for_export(
    db: Session,
    user_id: int,
    start_date: date,
    end_date: date,
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
):
    query = _build_filtered_query(db, user_id, account_id, category_id, type, None, start_date, end_date)
    return (
        query.options(
            joinedload(Transaction.account),
            joinedload(Transaction.destination_account),
            joinedload(Transaction.category),
        )
        .order_by(Transaction.date.asc(), Transaction.time.asc().nullslast(), Transaction.id.asc())
        .all()
    )


def get_transaction(db: Session, user_id: int, transaction_id: int):
    return db.query(Transaction).filter(
        Transaction.id == transaction_id, Transaction.user_id == user_id
    ).first()


def create_transaction(db: Session, user_id: int, transaction_in: TransactionCreate) -> Transaction:
    validate_transaction_category(db, transaction_in.category_id, transaction_in.type)
    data = transaction_in.model_dump()
    if data.get("time") is None:
        data["time"] = datetime.now().time()
    data["destination_amount"] = _resolve_destination_amount(
        db, data["account_id"], data.get("destination_account_id"), data["amount"], data["type"]
    )
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
    effective_amount = updates["amount"] if "amount" in updates else transaction.amount

    validate_transaction_category(db, effective_category_id, effective_type)
    _validate_transfer_fields(effective_type, effective_account_id, effective_destination_id)

    for field, value in updates.items():
        setattr(transaction, field, value)

    transaction.destination_amount = _resolve_destination_amount(
        db, effective_account_id, effective_destination_id, effective_amount, effective_type
    )

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

    category_ids = {t.category_id for t in transactions if t.category_id is not None}
    if "category_id" in updates and updates["category_id"] is not None:
        category_ids.add(updates["category_id"])
    categories = (
        {c.id: c for c in db.query(Category).filter(Category.id.in_(category_ids)).all()} if category_ids else {}
    )

    for transaction in transactions:
        for field, value in updates.items():
            setattr(transaction, field, value)
        effective_type = updates.get("type", transaction.type)
        if transaction.category_id is not None:
            category = categories.get(transaction.category_id)
            if category is not None and effective_type not in (category.types or []):
                transaction.category_id = None
    db.commit()
    return len(transactions)


def find_duplicate_groups(db: Session, user_id: int) -> list[dict]:
    """Transactions that share account, category, type, amount, description and date —
    the usual signature of an accidental double entry (e.g. an import run twice)."""
    rows = (
        db.query(
            Transaction.account_id,
            Transaction.category_id,
            Transaction.type,
            Transaction.amount,
            Transaction.description,
            Transaction.date,
            func.count(Transaction.id),
            func.array_agg(Transaction.id),
        )
        .filter(Transaction.user_id == user_id)
        .group_by(
            Transaction.account_id,
            Transaction.category_id,
            Transaction.type,
            Transaction.amount,
            Transaction.description,
            Transaction.date,
        )
        .having(func.count(Transaction.id) > 1)
        .all()
    )
    return [
        {
            "account_id": account_id,
            "category_id": category_id,
            "type": type_,
            "amount": amount,
            "description": description,
            "date": date_,
            "count": count,
            "transaction_ids": sorted(ids),
        }
        for account_id, category_id, type_, amount, description, date_, count, ids in rows
    ]
