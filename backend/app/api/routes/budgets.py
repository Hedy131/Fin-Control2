from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut
from app.crud import budget as crud_budget
from app.crud.period import Period, resolve_period_end

router = APIRouter(prefix="/budgets", tags=["budgets"])


def _to_out(db: Session, user_id: int, budget) -> BudgetOut:
    period_end = resolve_period_end(db, user_id, budget.period_start)
    out = BudgetOut.model_validate(budget)
    out.period_end = period_end
    out.spent = crud_budget.compute_spent(
        db, user_id, budget.category_id, Period(start=budget.period_start, end=period_end)
    )
    return out


@router.get("/", response_model=List[BudgetOut])
def list_budgets(
    period_start: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = crud_budget.get_budgets(db, current_user.id, period_start)
    return [_to_out(db, current_user.id, b) for b in budgets]


@router.post("/", response_model=BudgetOut, status_code=201)
def create_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        budget = crud_budget.create_budget(db, current_user.id, budget_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _to_out(db, current_user.id, budget)


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: int,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = crud_budget.get_budget(db, current_user.id, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    try:
        budget = crud_budget.update_budget(db, budget, budget_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _to_out(db, current_user.id, budget)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget = crud_budget.get_budget(db, current_user.id, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    crud_budget.delete_budget(db, budget)
