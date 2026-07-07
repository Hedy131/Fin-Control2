"""Optional helper: seed default categories for quick manual testing.
Run inside the backend container: python seed.py
"""
from app.core.database import SessionLocal
from app.models.category import Category
from app.models.enums import TransactionType
from app.crud.user import get_or_create_default_user

DEFAULT_CATEGORIES = [
    # name, types, is_salary, color, icon
    ("Salario", [TransactionType.income], True, "#22c55e", "briefcase"),
    ("Freelance", [TransactionType.income], False, "#16a34a", "laptop"),
    ("Reembolso", [TransactionType.income, TransactionType.expense], False, "#a855f7", "rotate-ccw"),
    ("Alimentacao", [TransactionType.expense], False, "#ef4444", "utensils"),
    ("Transporte", [TransactionType.expense], False, "#f97316", "car"),
    ("Moradia", [TransactionType.expense], False, "#eab308", "home"),
    ("Saude", [TransactionType.expense], False, "#06b6d4", "heart"),
    ("Lazer", [TransactionType.expense], False, "#8b5cf6", "smile"),
    ("Educacao", [TransactionType.expense], False, "#3b82f6", "book"),
    ("Investimentos", [TransactionType.investment], False, "#0ea5e9", "trending-up"),
    ("Levantamento", [TransactionType.transfer], False, "#64748b", "arrow-right-left"),
]


def main():
    db = SessionLocal()
    user = get_or_create_default_user(db)
    for name, types, is_salary, color, icon in DEFAULT_CATEGORIES:
        exists = db.query(Category).filter(Category.user_id == user.id, Category.name == name).first()
        if not exists:
            db.add(
                Category(user_id=user.id, name=name, types=types, is_salary=is_salary, color=color, icon=icon)
            )
    db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    main()
