from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut
from app.crud import budget as crud_budget

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/", response_model=List[BudgetOut])
def list_budgets(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = crud_budget.get_budgets(db, current_user.id, month, year)
    result = []
    for b in budgets:
        out = BudgetOut.model_validate(b)
        out.spent = crud_budget.compute_spent(db, current_user.id, b.category_id, b.month, b.year)
        result.append(out)
    return result


@router.post("/", response_model=BudgetOut, status_code=201)
def create_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = crud_budget.create_budget(db, current_user.id, budget_in)
    out = BudgetOut.model_validate(budget)
    out.spent = crud_budget.compute_spent(db, current_user.id, budget.category_id, budget.month, budget.year)
    return out


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
    out = BudgetOut.model_validate(budget)
    out.spent = crud_budget.compute_spent(db, current_user.id, budget.category_id, budget.month, budget.year)
    return out


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget = crud_budget.get_budget(db, current_user.id, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    crud_budget.delete_budget(db, budget)
