from sqlalchemy.orm import Session

from app.models.investment import InvestmentPosition
from app.schemas.investment import InvestmentPositionCreate, InvestmentPositionUpdate


def get_investment_positions(db: Session, user_id: int):
    return db.query(InvestmentPosition).filter(InvestmentPosition.user_id == user_id).all()


def get_investment_position(db: Session, user_id: int, position_id: int):
    return db.query(InvestmentPosition).filter(
        InvestmentPosition.id == position_id, InvestmentPosition.user_id == user_id
    ).first()


def create_investment_position(db: Session, user_id: int, position_in: InvestmentPositionCreate) -> InvestmentPosition:
    position = InvestmentPosition(user_id=user_id, **position_in.model_dump())
    db.add(position)
    db.commit()
    db.refresh(position)
    return position


def update_investment_position(db: Session, position: InvestmentPosition, position_in: InvestmentPositionUpdate):
    for field, value in position_in.model_dump(exclude_unset=True).items():
        setattr(position, field, value)
    db.commit()
    db.refresh(position)
    return position


def delete_investment_position(db: Session, position: InvestmentPosition):
    db.delete(position)
    db.commit()


def adjust_invested_amount(db: Session, position_id: int, delta: float) -> None:
    position = db.query(InvestmentPosition).filter(InvestmentPosition.id == position_id).first()
    if position is None:
        return
    position.invested_amount = round(position.invested_amount + delta, 2)
    db.commit()
