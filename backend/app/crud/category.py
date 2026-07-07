from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.enums import TransactionType
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session, user_id: int):
    return db.query(Category).filter(Category.user_id == user_id).all()


def get_category(db: Session, user_id: int, category_id: int):
    return db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()


def create_category(db: Session, user_id: int, category_in: CategoryCreate) -> Category:
    category = Category(user_id=user_id, **category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category: Category, category_in: CategoryUpdate):
    updates = category_in.model_dump(exclude_unset=True)

    effective_types = updates["types"] if "types" in updates else category.types
    effective_is_salary = updates["is_salary"] if "is_salary" in updates else category.is_salary

    if not effective_types:
        raise ValueError("a categoria precisa de pelo menos um tipo")
    if effective_is_salary and TransactionType.income not in effective_types:
        raise ValueError("is_salary requer que 'income' esteja entre os tipos da categoria")

    for field, value in updates.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category):
    db.delete(category)
    db.commit()
