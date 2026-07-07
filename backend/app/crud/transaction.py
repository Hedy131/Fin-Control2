from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import Optional
from datetime import date

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def get_transactions(
    db: Session,
    user_id: int,
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    return query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()


def get_transaction(db: Session, user_id: int, transaction_id: int):
    return db.query(Transaction).filter(
        Transaction.id == transaction_id, Transaction.user_id == user_id
    ).first()


def create_transaction(db: Session, user_id: int, transaction_in: TransactionCreate) -> Transaction:
    transaction = Transaction(user_id=user_id, **transaction_in.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(db: Session, transaction: Transaction, transaction_in: TransactionUpdate):
    for field, value in transaction_in.model_dump(exclude_unset=True).items():
        setattr(transaction, field, value)
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction: Transaction):
    db.delete(transaction)
    db.commit()


def get_transactions_by_month(db: Session, user_id: int, month: int, year: int):
    return db.query(Transaction).filter(
        Transaction.user_id == user_id,
        extract("month", Transaction.date) == month,
        extract("year", Transaction.date) == year,
    ).all()
