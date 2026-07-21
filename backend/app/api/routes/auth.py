import hmac

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.crud import user as crud_user
from app.crud.user import get_or_create_default_user, get_effective_pin, set_pin
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import PinLogin, PinChange, Token
from app.services.email import send_pin_recovery_email

router = APIRouter(prefix="/auth", tags=["auth"])


def _lockout_error(seconds: int) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Demasiadas tentativas erradas. Tente novamente em {seconds} segundos.",
        headers={"Retry-After": str(seconds)},
    )


@router.post("/login", response_model=Token)
def login(payload: PinLogin, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)

    remaining = crud_user.login_lockout_seconds_remaining(user)
    if remaining > 0:
        raise _lockout_error(remaining)

    if not hmac.compare_digest(payload.pin, get_effective_pin(user)):
        crud_user.register_failed_login(db, user)
        remaining = crud_user.login_lockout_seconds_remaining(user)
        if remaining > 0:
            raise _lockout_error(remaining)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PIN incorreto",
        )

    crud_user.register_successful_login(db, user)
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-pin", status_code=204)
def forgot_pin(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)

    remaining = crud_user.recovery_cooldown_seconds_remaining(user)
    if remaining > 0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Já foi enviado um email recentemente. Tente novamente em {remaining} segundos.",
            headers={"Retry-After": str(remaining)},
        )

    try:
        send_pin_recovery_email(get_effective_pin(user))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível enviar o email. Tente novamente mais tarde.",
        )

    crud_user.register_recovery_sent(db, user)


@router.put("/pin", status_code=204)
def change_pin(
    payload: PinChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not hmac.compare_digest(payload.current_pin, get_effective_pin(current_user)):
        raise HTTPException(status_code=400, detail="PIN atual incorreto")
    set_pin(db, current_user, payload.new_pin)
