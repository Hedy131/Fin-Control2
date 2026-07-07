from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.investment import InvestmentPositionCreate, InvestmentPositionUpdate, InvestmentPositionOut
from app.crud import investment as crud_investment

router = APIRouter(prefix="/investments", tags=["investments"])


def _to_out(position) -> InvestmentPositionOut:
    out = InvestmentPositionOut.model_validate(position)
    out.gain_loss = round(position.current_value - position.invested_amount, 2)
    out.gain_loss_pct = (
        round((out.gain_loss / position.invested_amount) * 100, 2) if position.invested_amount else None
    )
    return out


@router.get("/", response_model=List[InvestmentPositionOut])
def list_investment_positions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [_to_out(p) for p in crud_investment.get_investment_positions(db, current_user.id)]


@router.post("/", response_model=InvestmentPositionOut, status_code=201)
def create_investment_position(
    position_in: InvestmentPositionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    position = crud_investment.create_investment_position(db, current_user.id, position_in)
    return _to_out(position)


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
    return _to_out(position)


@router.delete("/{position_id}", status_code=204)
def delete_investment_position(
    position_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    position = crud_investment.get_investment_position(db, current_user.id, position_id)
    if not position:
        raise HTTPException(status_code=404, detail="Investment position not found")
    crud_investment.delete_investment_position(db, position)
