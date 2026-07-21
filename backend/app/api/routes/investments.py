from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.investment import InvestmentPositionOut
from app.crud import investment as crud_investment

router = APIRouter(prefix="/investments", tags=["investments"])


def _to_out(position, invested_amount: float, interest_paid: float, currency) -> InvestmentPositionOut:
    out = InvestmentPositionOut.model_validate(position)
    out.currency = currency
    out.invested_amount = invested_amount
    out.interest_paid = interest_paid
    return out


@router.get("/", response_model=List[InvestmentPositionOut])
def list_investment_positions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    positions = crud_investment.get_investment_positions(db, current_user.id)
    category_ids = [p.category_id for p in positions]
    contributed_by_category = crud_investment.compute_contributed_for_categories(db, current_user.id, category_ids)
    interest_by_category = crud_investment.compute_interest_for_categories(db, current_user.id, category_ids)
    currency_by_category = crud_investment.resolve_currencies_for_categories(db, current_user.id, category_ids)

    return [
        _to_out(
            p,
            round(p.initial_invested_amount + contributed_by_category.get(p.category_id, 0.0), 2),
            interest_by_category.get(p.category_id, 0.0),
            currency_by_category.get(p.category_id, p.currency.value if hasattr(p.currency, "value") else p.currency),
        )
        for p in positions
    ]
