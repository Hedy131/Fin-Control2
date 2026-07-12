from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.fx import FxRatesResponse
from app.services.fx import get_rates

router = APIRouter(prefix="/fx", tags=["fx"])


@router.get("/rates", response_model=FxRatesResponse)
def rates(base: str = Query("AOA"), current_user: User = Depends(get_current_user)):
    try:
        return get_rates(base)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
