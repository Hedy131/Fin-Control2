from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.account import Account
from app.schemas.goal import GoalUpdate, GoalOut
from app.crud import goal as crud_goal
from app.crud.account import compute_balance, compute_balances_for_accounts

router = APIRouter(prefix="/goals", tags=["goals"])


def _to_out(goal, progress: float) -> GoalOut:
    out = GoalOut.model_validate(goal)
    out.progress = round(progress, 2)
    out.progress_pct = min(100, round(progress / goal.target_amount * 100, 2)) if goal.target_amount else 0
    out.days_remaining = (goal.target_date - date.today()).days if goal.target_date else None
    return out


@router.get("/", response_model=List[GoalOut])
def list_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = crud_goal.get_goals(db, current_user.id)

    linked_ids = [g.linked_account_id for g in goals if g.linked_account_id]
    linked_accounts = db.query(Account).filter(Account.id.in_(linked_ids)).all() if linked_ids else []
    balances = compute_balances_for_accounts(db, linked_accounts)

    unlinked_category_ids = [g.category_id for g in goals if not g.linked_account_id]
    contributed_by_category = crud_goal.compute_contributed_for_categories(
        db, current_user.id, unlinked_category_ids
    )

    result = []
    for g in goals:
        if g.linked_account_id:
            progress = balances.get(g.linked_account_id, 0.0)
        else:
            progress = round(g.initial_amount + contributed_by_category.get(g.category_id, 0.0), 2)
        result.append(_to_out(g, progress))
    return result


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = crud_goal.get_goal(db, current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal = crud_goal.update_goal(db, goal, goal_in)
    if goal.linked_account_id and goal.linked_account:
        progress = compute_balance(db, goal.linked_account)
    else:
        progress = crud_goal.compute_progress(db, current_user.id, goal.category_id, goal.initial_amount)
    return _to_out(goal, progress)
