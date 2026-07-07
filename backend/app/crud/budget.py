from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.budget import Budget
from app.models.transaction import Transaction, TransactionType
from app.schemas.budget import BudgetCreate, BudgetUpdate


def get_budgets(db: Session, user_id: int, month: int = None, year: int = None):
    query = db.query(Budget).filter(Budget.user_id == user_id)
    if month:
        query = query.filter(Budget.month == month)
    if year:
        query = query.filter(Budget.year == year)
    return query.all()


def get_budget(db: Session, user_id: int, budget_id: int):
    return db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()


def create_budget(db: Session, user_id: int, budget_in: BudgetCreate) -> Budget:
    budget = Budget(user_id=user_id, **budget_in.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def update_budget(db: Session, budget: Budget, budget_in: BudgetUpdate):
    for field, value in budget_in.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, budget: Budget):
    db.delete(budget)
    db.commit()


def compute_spent(db: Session, user_id: int, category_id: int, month: int, year: int) -> float:
    spent = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.user_id == user_id,
        Transaction.category_id == category_id,
        Transaction.type == TransactionType.expense,
        extract("month", Transaction.date) == month,
        extract("year", Transaction.date) == year,
    ).scalar()
    return round(spent, 2)
