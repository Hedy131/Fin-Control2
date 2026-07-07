from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.period import PeriodOut
from app.crud.period import get_last_n_periods

router = APIRouter(prefix="/periods", tags=["periods"])


@router.get("/", response_model=List[PeriodOut])
def list_periods(n: int = 12, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    periods = get_last_n_periods(db, current_user.id, n=n)
    return [PeriodOut(start=p.start, end=p.end) for p in periods]
