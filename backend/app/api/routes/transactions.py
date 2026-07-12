from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.enums import TransactionType
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionOut,
    TransactionsSummary,
    TransactionBulkDeleteRequest,
    TransactionBulkDeleteResponse,
    TransactionBulkUpdateRequest,
    TransactionBulkUpdateResponse,
)
from app.crud import transaction as crud_transaction
from app.crud import account as crud_account
from app.crud import category as crud_category

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=List[TransactionOut])
def list_transactions(
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud_transaction.get_transactions(
        db, current_user.id, account_id, category_id, type, search, start_date, end_date, skip, limit
    )


@router.get("/summary", response_model=TransactionsSummary)
def get_transactions_summary(
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    by_currency = crud_transaction.get_transactions_summary(
        db, current_user.id, account_id, category_id, type, search, start_date, end_date
    )
    return {"by_currency": by_currency}


@router.post("/bulk-delete", response_model=TransactionBulkDeleteResponse)
def bulk_delete_transactions(
    payload: TransactionBulkDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = crud_transaction.delete_transactions(db, current_user.id, payload.ids)
    return {"deleted": deleted}


@router.post("/bulk-update", response_model=TransactionBulkUpdateResponse)
def bulk_update_transactions(
    payload: TransactionBulkUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.account_id is not None and not crud_account.get_account(db, current_user.id, payload.account_id):
        raise HTTPException(status_code=404, detail="Account not found")
    if payload.category_id is not None and not crud_category.get_category(db, current_user.id, payload.category_id):
        raise HTTPException(status_code=404, detail="Category not found")

    updates = {}
    if payload.account_id is not None:
        updates["account_id"] = payload.account_id
    if payload.category_id is not None:
        updates["category_id"] = payload.category_id
    if payload.type is not None:
        updates["type"] = payload.type

    updated = crud_transaction.bulk_update_transactions(db, current_user.id, payload.ids, updates)
    return {"updated": updated}


@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return crud_transaction.create_transaction(db, current_user.id, transaction_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transaction = crud_transaction.get_transaction(db, current_user.id, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = crud_transaction.get_transaction(db, current_user.id, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    try:
        return crud_transaction.update_transaction(db, transaction, transaction_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transaction = crud_transaction.get_transaction(db, current_user.id, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    crud_transaction.delete_transaction(db, transaction)
