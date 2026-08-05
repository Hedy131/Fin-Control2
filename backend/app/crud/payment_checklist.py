from datetime import date
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.payment_checklist import PaymentChecklistItem
from app.models.transaction import Transaction
from app.schemas.payment_checklist import ChecklistItemCreate, ChecklistItemUpdate


def get_items(db: Session, user_id: int) -> List[PaymentChecklistItem]:
    return (
        db.query(PaymentChecklistItem)
        .filter(PaymentChecklistItem.user_id == user_id)
        .order_by(PaymentChecklistItem.sort_order, PaymentChecklistItem.id)
        .all()
    )


def get_item(db: Session, user_id: int, item_id: int) -> Optional[PaymentChecklistItem]:
    return (
        db.query(PaymentChecklistItem)
        .filter(PaymentChecklistItem.id == item_id, PaymentChecklistItem.user_id == user_id)
        .first()
    )


def create_item(db: Session, user_id: int, item_in: ChecklistItemCreate) -> PaymentChecklistItem:
    max_order = (
        db.query(func.coalesce(func.max(PaymentChecklistItem.sort_order), -1))
        .filter(PaymentChecklistItem.user_id == user_id)
        .scalar()
    )
    item = PaymentChecklistItem(user_id=user_id, sort_order=max_order + 1, **item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_item(db: Session, item: PaymentChecklistItem, item_in: ChecklistItemUpdate) -> PaymentChecklistItem:
    for field, value in item_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item: PaymentChecklistItem) -> None:
    db.delete(item)
    db.commit()


def compute_paid_category_ids(
    db: Session, user_id: int, category_ids: List[int], start_date: date, end_date: Optional[date]
) -> set:
    """category_ids (out of the given ones) that have at least one transaction dated within
    [start_date, end_date] — used to auto-tick checklist items linked to a category."""
    if not category_ids:
        return set()
    query = db.query(Transaction.category_id).filter(
        Transaction.user_id == user_id,
        Transaction.category_id.in_(category_ids),
        Transaction.date >= start_date,
    )
    if end_date is not None:
        query = query.filter(Transaction.date <= end_date)
    rows = query.distinct().all()
    return {r[0] for r in rows}
