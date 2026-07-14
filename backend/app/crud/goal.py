from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.enums import TransactionType
from app.schemas.goal import GoalUpdate
from app.crud.investment import ALL_TIME
from app.crud.period import sum_transactions


def get_goals(db: Session, user_id: int):
    """One goal per savings-type category, auto-creating any that don't exist yet."""
    savings_categories = (
        db.query(Category)
        .filter(Category.user_id == user_id, Category.types.any(TransactionType.savings))
        .order_by(Category.name)
        .all()
    )
    existing = {g.category_id: g for g in db.query(Goal).filter(Goal.user_id == user_id).all()}

    result = []
    created = False
    for category in savings_categories:
        goal = existing.get(category.id)
        if goal is None:
            goal = Goal(user_id=user_id, category_id=category.id)
            db.add(goal)
            created = True
        result.append(goal)

    if created:
        db.commit()
        for g in result:
            db.refresh(g)
    return result


def get_goal(db: Session, user_id: int, goal_id: int):
    return db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()


def update_goal(db: Session, goal: Goal, goal_in: GoalUpdate):
    for field, value in goal_in.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


def compute_progress(db: Session, user_id: int, category_id: int, initial_amount: float) -> float:
    contributed = sum_transactions(db, user_id, TransactionType.savings, ALL_TIME, category_id=category_id)
    return round(initial_amount + contributed, 2)


def compute_contributed_for_categories(db: Session, user_id: int, category_ids: list) -> dict:
    """all-time savings contributions per category_id in one grouped query."""
    if not category_ids:
        return {}
    rows = (
        db.query(Transaction.category_id, func.coalesce(func.sum(Transaction.amount), 0.0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.savings,
            Transaction.category_id.in_(category_ids),
        )
        .group_by(Transaction.category_id)
        .all()
    )
    return {category_id: round(amount or 0.0, 2) for category_id, amount in rows}
