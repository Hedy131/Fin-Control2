from typing import Optional
from datetime import date

from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.enums import TransactionType
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.crud.period import Period, sum_transactions


def get_budgets(db: Session, user_id: int, period_start: Optional[date] = None):
    query = db.query(Budget).filter(Budget.user_id == user_id)
    if period_start:
        query = query.filter(Budget.period_start == period_start)
    return query.all()


def get_budget(db: Session, user_id: int, budget_id: int):
    return db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()


def _check_duplicate(db: Session, user_id: int, category_id: int, period_start: date, exclude_id: Optional[int] = None):
    query = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.category_id == category_id,
        Budget.period_start == period_start,
    )
    if exclude_id is not None:
        query = query.filter(Budget.id != exclude_id)
    if query.first() is not None:
        raise ValueError("Já existe um orçamento para esta categoria neste período")


def create_budget(db: Session, user_id: int, budget_in: BudgetCreate) -> Budget:
    _check_duplicate(db, user_id, budget_in.category_id, budget_in.period_start)
    budget = Budget(user_id=user_id, **budget_in.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def update_budget(db: Session, budget: Budget, budget_in: BudgetUpdate):
    updates = budget_in.model_dump(exclude_unset=True)
    effective_category_id = updates.get("category_id", budget.category_id)
    effective_period_start = updates.get("period_start", budget.period_start)
    if "category_id" in updates or "period_start" in updates:
        _check_duplicate(db, budget.user_id, effective_category_id, effective_period_start, exclude_id=budget.id)

    for field, value in updates.items():
        setattr(budget, field, value)
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, budget: Budget):
    db.delete(budget)
    db.commit()


def compute_spent(db: Session, user_id: int, category_id: int, period: Period) -> float:
    return sum_transactions(db, user_id, TransactionType.expense, period, category_id=category_id)
