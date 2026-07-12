import hmac

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.crud.user import get_or_create_default_user, get_effective_pin, set_pin
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import PinLogin, PinChange, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(payload: PinLogin, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    if not hmac.compare_digest(payload.pin, get_effective_pin(user)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PIN incorreto",
        )
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.put("/pin", status_code=204)
def change_pin(
    payload: PinChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not hmac.compare_digest(payload.current_pin, get_effective_pin(current_user)):
        raise HTTPException(status_code=400, detail="PIN atual incorreto")
    set_pin(db, current_user, payload.new_pin)
