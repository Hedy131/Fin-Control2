from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.account import AccountCreate, AccountUpdate, AccountOut
from app.crud import account as crud_account

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/", response_model=List[AccountOut])
def list_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = crud_account.get_accounts(db, current_user.id)
    balances = crud_account.compute_balances_for_accounts(db, accounts)
    result = []
    for acc in accounts:
        out = AccountOut.model_validate(acc)
        out.current_balance = balances.get(acc.id, 0.0)
        result.append(out)
    return result


@router.post("/", response_model=AccountOut, status_code=201)
def create_account(
    account_in: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = crud_account.create_account(db, current_user.id, account_in)
    out = AccountOut.model_validate(account)
    out.current_balance = crud_account.compute_balance(db, account)
    return out


@router.get("/{account_id}", response_model=AccountOut)
def get_account(account_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = crud_account.get_account(db, current_user.id, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    out = AccountOut.model_validate(account)
    out.current_balance = crud_account.compute_balance(db, account)
    return out


@router.put("/{account_id}", response_model=AccountOut)
def update_account(
    account_id: int,
    account_in: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = crud_account.get_account(db, current_user.id, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account = crud_account.update_account(db, account, account_in)
    out = AccountOut.model_validate(account)
    out.current_balance = crud_account.compute_balance(db, account)
    return out


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = crud_account.get_account(db, current_user.id, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    crud_account.delete_account(db, account)
