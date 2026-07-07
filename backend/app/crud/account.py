from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.account import Account
from app.models.transaction import Transaction, TransactionType
from app.schemas.account import AccountCreate, AccountUpdate


def get_accounts(db: Session, user_id: int):
    return db.query(Account).filter(Account.user_id == user_id).all()


def get_account(db: Session, user_id: int, account_id: int):
    return db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()


def create_account(db: Session, user_id: int, account_in: AccountCreate) -> Account:
    account = Account(user_id=user_id, **account_in.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def update_account(db: Session, account: Account, account_in: AccountUpdate):
    for field, value in account_in.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


def delete_account(db: Session, account: Account):
    db.delete(account)
    db.commit()


def compute_balance(db: Session, account: Account) -> float:
    income = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.account_id == account.id, Transaction.type == TransactionType.income
    ).scalar()
    expense = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.account_id == account.id, Transaction.type == TransactionType.expense
    ).scalar()
    return round(account.initial_balance + income - expense, 2)
