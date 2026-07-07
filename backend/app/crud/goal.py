from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate


def get_goals(db: Session, user_id: int):
    return db.query(Goal).filter(Goal.user_id == user_id).all()


def get_goal(db: Session, user_id: int, goal_id: int):
    return db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()


def create_goal(db: Session, user_id: int, goal_in: GoalCreate) -> Goal:
    goal = Goal(user_id=user_id, **goal_in.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_goal(db: Session, goal: Goal, goal_in: GoalUpdate):
    for field, value in goal_in.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, goal: Goal):
    db.delete(goal)
    db.commit()
