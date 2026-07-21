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
    if column == "account_id":
        filter_col = Transaction.account_id
        amount_expr = Transaction.amount
    else:
        filter_col = Transaction.destination_account_id
        # transferências entre moedas diferentes gravam o valor convertido em destination_amount
        amount_expr = func.coalesce(Transaction.destination_amount, Transaction.amount)
    return db.query(func.coalesce(func.sum(amount_expr), 0.0)).filter(
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


def _grouped_sum(db: Session, account_ids: list, type: TransactionType, column="account_id", as_of=None) -> dict:
    if column == "account_id":
        filter_col = Transaction.account_id
        amount_expr = Transaction.amount
    else:
        filter_col = Transaction.destination_account_id
        amount_expr = func.coalesce(Transaction.destination_amount, Transaction.amount)
    query = db.query(filter_col, func.coalesce(func.sum(amount_expr), 0.0)).filter(
        filter_col.in_(account_ids), Transaction.type == type
    )
    if as_of is not None:
        query = query.filter(Transaction.date <= as_of)
    rows = query.group_by(filter_col).all()
    return {account_id: amount for account_id, amount in rows}


def compute_balances_for_accounts(db: Session, accounts: list, as_of=None) -> dict:
    """Balance for every account in one batch (6 queries total instead of 6 per account).
    `as_of`, if given, limits to transactions dated on or before that date — a
    point-in-time balance instead of the live one."""
    ids = [a.id for a in accounts]
    if not ids:
        return {}
    income = _grouped_sum(db, ids, TransactionType.income, as_of=as_of)
    expense = _grouped_sum(db, ids, TransactionType.expense, as_of=as_of)
    investment_out = _grouped_sum(db, ids, TransactionType.investment, as_of=as_of)
    savings_out = _grouped_sum(db, ids, TransactionType.savings, as_of=as_of)
    transfer_out = _grouped_sum(db, ids, TransactionType.transfer, as_of=as_of)
    transfer_in = _grouped_sum(db, ids, TransactionType.transfer, column="destination_account_id", as_of=as_of)

    return {
        a.id: round(
            a.initial_balance
            + income.get(a.id, 0.0)
            - expense.get(a.id, 0.0)
            - investment_out.get(a.id, 0.0)
            - savings_out.get(a.id, 0.0)
            - transfer_out.get(a.id, 0.0)
            + transfer_in.get(a.id, 0.0),
            2,
        )
        for a in accounts
    }
