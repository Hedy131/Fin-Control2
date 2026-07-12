from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetUpdate, BudgetOut
from app.crud import budget as crud_budget
from app.crud.period import Period, get_current_period, resolve_period_end

router = APIRouter(prefix="/budgets", tags=["budgets"])


def _to_out(db: Session, user_id: int, budget, period_start: date) -> BudgetOut:
    period_end = resolve_period_end(db, user_id, period_start)
    spent = crud_budget.compute_spent(
        db, user_id, budget.category_id, Period(start=period_start, end=period_end)
    )
    return BudgetOut(
        id=budget.id,
        user_id=budget.user_id,
        category_id=budget.category_id,
        amount=budget.amount,
        period_start=period_start,
        period_end=period_end,
        spent=spent,
    )


@router.get("/", response_model=List[BudgetOut])
def list_budgets(
    period_start: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resolved_period_start = period_start or get_current_period(db, current_user.id).start
    budgets = crud_budget.get_budgets(db, current_user.id)
    return [_to_out(db, current_user.id, b, resolved_period_start) for b in budgets]


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: int,
    budget_in: BudgetUpdate,
    period_start: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = crud_budget.get_budget(db, current_user.id, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget = crud_budget.update_budget(db, budget, budget_in)
    resolved_period_start = period_start or get_current_period(db, current_user.id).start
    return _to_out(db, current_user.id, budget, resolved_period_start)
