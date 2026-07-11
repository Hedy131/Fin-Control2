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
    resolved_period_start = period_start or get_current_period(db, current_user.id).start
    budgets = crud_budget.get_budgets(db, current_user.id, resolved_period_start)
    return [_to_out(db, current_user.id, b) for b in budgets]


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
    budget = crud_budget.update_budget(db, budget, budget_in)
    return _to_out(db, current_user.id, budget)
