from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.payment_checklist import ChecklistItemCreate, ChecklistItemUpdate, ChecklistItemOut
from app.crud import payment_checklist as crud_checklist
from app.crud.period import get_current_period

router = APIRouter(prefix="/payment-checklist", tags=["payment-checklist"])


def _to_out(item, paid: bool) -> ChecklistItemOut:
    out = ChecklistItemOut.model_validate(item)
    out.paid = paid
    return out


@router.get("/", response_model=List[ChecklistItemOut])
def list_items(
    period_start: Optional[date] = None,
    period_end: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if period_start is None:
        current = get_current_period(db, current_user.id)
        period_start, period_end = current.start, current.end

    items = crud_checklist.get_items(db, current_user.id)
    category_ids = [i.category_id for i in items if i.category_id]
    paid_ids = crud_checklist.compute_paid_category_ids(db, current_user.id, category_ids, period_start, period_end)
    return [_to_out(i, i.category_id in paid_ids if i.category_id else False) for i in items]


@router.post("/", response_model=ChecklistItemOut)
def create_item(
    item_in: ChecklistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = crud_checklist.create_item(db, current_user.id, item_in)
    return _to_out(item, False)


@router.put("/{item_id}", response_model=ChecklistItemOut)
def update_item(
    item_id: int,
    item_in: ChecklistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = crud_checklist.get_item(db, current_user.id, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item = crud_checklist.update_item(db, item, item_in)
    return _to_out(item, False)


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = crud_checklist.get_item(db, current_user.id, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    crud_checklist.delete_item(db, item)
