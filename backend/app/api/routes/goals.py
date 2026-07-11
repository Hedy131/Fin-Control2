from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.goal import GoalUpdate, GoalOut
from app.crud import goal as crud_goal
from app.crud.account import compute_balance

router = APIRouter(prefix="/goals", tags=["goals"])


def _to_out(db: Session, user_id: int, goal) -> GoalOut:
    if goal.linked_account_id and goal.linked_account:
        progress = compute_balance(db, goal.linked_account)
    else:
        progress = crud_goal.compute_progress(db, user_id, goal.category_id, goal.initial_amount)

    out = GoalOut.model_validate(goal)
    out.progress = round(progress, 2)
    out.progress_pct = min(100, round(progress / goal.target_amount * 100, 2)) if goal.target_amount else 0
    out.days_remaining = (goal.target_date - date.today()).days if goal.target_date else None
    return out


@router.get("/", response_model=List[GoalOut])
def list_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [_to_out(db, current_user.id, g) for g in crud_goal.get_goals(db, current_user.id)]


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
    return _to_out(db, current_user.id, goal)
