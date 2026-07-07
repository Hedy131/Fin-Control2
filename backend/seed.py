"""Optional helper: seed default categories for quick manual testing.
Run inside the backend container: python seed.py
"""
from app.core.database import SessionLocal
from app.models.category import Category, CategoryType
from app.crud.user import get_or_create_default_user

DEFAULT_CATEGORIES = [
    ("Salario", CategoryType.income, "#22c55e", "briefcase"),
    ("Freelance", CategoryType.income, "#16a34a", "laptop"),
    ("Alimentacao", CategoryType.expense, "#ef4444", "utensils"),
    ("Transporte", CategoryType.expense, "#f97316", "car"),
    ("Moradia", CategoryType.expense, "#eab308", "home"),
    ("Saude", CategoryType.expense, "#06b6d4", "heart"),
    ("Lazer", CategoryType.expense, "#8b5cf6", "smile"),
    ("Educacao", CategoryType.expense, "#3b82f6", "book"),
]


def main():
    db = SessionLocal()
    user = get_or_create_default_user(db)
    for name, ctype, color, icon in DEFAULT_CATEGORIES:
        exists = db.query(Category).filter(Category.user_id == user.id, Category.name == name).first()
        if not exists:
            db.add(Category(user_id=user.id, name=name, type=ctype, color=color, icon=icon))
    db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    main()
