from datetime import date

from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.category import Category
from app.models.enums import TransactionType
from app.schemas.budget import BudgetUpdate
from app.crud.period import Period, sum_transactions


def get_budgets(db: Session, user_id: int, period_start: date):
    """One budget per expense-type category for period_start, auto-creating any
    that don't exist yet (copying the most recent prior amount for that
    category, else 0)."""
    expense_categories = (
        db.query(Category)
        .filter(Category.user_id == user_id, Category.types.any(TransactionType.expense))
        .order_by(Category.name)
        .all()
    )
    existing = {
        b.category_id: b
        for b in db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.period_start == period_start)
        .all()
    }

    result = []
    created = False
    for category in expense_categories:
        budget = existing.get(category.id)
        if budget is None:
            previous = (
                db.query(Budget)
                .filter(
                    Budget.user_id == user_id,
                    Budget.category_id == category.id,
                    Budget.period_start < period_start,
                )
                .order_by(Budget.period_start.desc())
                .first()
            )
            budget = Budget(
                user_id=user_id,
                category_id=category.id,
                amount=previous.amount if previous else 0.0,
                period_start=period_start,
            )
            db.add(budget)
            created = True
        result.append(budget)

    if created:
        db.commit()
        for b in result:
            db.refresh(b)
    return result


def get_budget(db: Session, user_id: int, budget_id: int):
    return db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()


def update_budget(db: Session, budget: Budget, budget_in: BudgetUpdate):
    for field, value in budget_in.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)
    db.commit()
    db.refresh(budget)
    return budget


def compute_spent(db: Session, user_id: int, category_id: int, period: Period) -> float:
    return sum_transactions(db, user_id, TransactionType.expense, period, category_id=category_id)
