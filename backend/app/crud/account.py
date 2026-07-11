from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.account import Account
from app.models.transaction import Transaction
from app.models.goal import Goal
from app.models.enums import TransactionType
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
    is_transfer_destination = (
        db.query(Transaction)
        .filter(Transaction.destination_account_id == account.id)
        .first()
    )
    if is_transfer_destination:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não é possível remover uma conta que é destino de transferências existentes.",
        )
    db.query(Goal).filter(Goal.linked_account_id == account.id).update({Goal.linked_account_id: None})
    db.delete(account)
    db.commit()


def _sum(db: Session, account_id: int, type: TransactionType, column="account_id") -> float:
    filter_col = Transaction.account_id if column == "account_id" else Transaction.destination_account_id
    return db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        filter_col == account_id, Transaction.type == type
    ).scalar()


def compute_balance(db: Session, account: Account) -> float:
    income = _sum(db, account.id, TransactionType.income)
    expense = _sum(db, account.id, TransactionType.expense)
    investment_out = _sum(db, account.id, TransactionType.investment)
    savings_out = _sum(db, account.id, TransactionType.savings)
    transfer_out = _sum(db, account.id, TransactionType.transfer)
    transfer_in = _sum(db, account.id, TransactionType.transfer, column="destination_account_id")
    return round(
        account.initial_balance
        + income
        - expense
        - investment_out
        - savings_out
        - transfer_out
        + transfer_in,
        2,
    )
