from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.investment import InvestmentPositionUpdate, InvestmentPositionOut
from app.crud import investment as crud_investment

router = APIRouter(prefix="/investments", tags=["investments"])


def _to_out(position, invested_amount: float) -> InvestmentPositionOut:
    out = InvestmentPositionOut.model_validate(position)
    out.invested_amount = invested_amount
    out.gain_loss = round(position.current_value - invested_amount, 2)
    out.gain_loss_pct = round((out.gain_loss / invested_amount) * 100, 2) if invested_amount else None
    return out


@router.get("/", response_model=List[InvestmentPositionOut])
def list_investment_positions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    positions = crud_investment.get_investment_positions(db, current_user.id)
    contributed_by_category = crud_investment.compute_contributed_for_categories(
        db, current_user.id, [p.category_id for p in positions]
    )
    return [
        _to_out(p, round(p.initial_invested_amount + contributed_by_category.get(p.category_id, 0.0), 2))
        for p in positions
    ]


@router.put("/{position_id}", response_model=InvestmentPositionOut)
def update_investment_position(
    position_id: int,
    position_in: InvestmentPositionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    position = crud_investment.get_investment_position(db, current_user.id, position_id)
    if not position:
        raise HTTPException(status_code=404, detail="Investment position not found")
    position = crud_investment.update_investment_position(db, position, position_in)
    invested_amount = crud_investment.compute_invested_amount(
        db, current_user.id, position.category_id, position.initial_invested_amount
    )
    return _to_out(position, invested_amount)
