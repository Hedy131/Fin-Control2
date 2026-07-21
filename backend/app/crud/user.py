import secrets
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserUpdate

DEFAULT_USER_EMAIL = "owner@fincontrol.local"

FREE_LOGIN_ATTEMPTS = 3
LOGIN_BASE_WAIT_SECONDS = 30
LOGIN_MAX_WAIT_SECONDS = 3600
RECOVERY_COOLDOWN_SECONDS = 300


def _seconds_since(moment: Optional[datetime], now: Optional[datetime] = None) -> Optional[float]:
    if moment is None:
        return None
    now = now or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return (now - moment).total_seconds()


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_or_create_default_user(db: Session) -> User:
    user = db.query(User).first()
    if user:
        return user
    user = User(
        email=DEFAULT_USER_EMAIL,
        full_name="Owner",
        hashed_password=secrets.token_hex(32),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, user_in: UserUpdate):
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    db.commit()
    db.refresh(user)
    return user


def get_effective_pin(user: User) -> str:
    return user.pin or settings.APP_PIN


def set_pin(db: Session, user: User, new_pin: str) -> User:
    user.pin = new_pin
    db.commit()
    db.refresh(user)
    return user


def login_lockout_seconds_remaining(user: User, now: Optional[datetime] = None) -> int:
    """Seconds the caller must still wait before another login attempt is accepted.
    The first FREE_LOGIN_ATTEMPTS failures are unrestricted; every failure beyond that
    doubles the wait (capped), so brute-forcing the PIN gets exponentially slower."""
    attempts = user.failed_login_attempts or 0
    if attempts <= FREE_LOGIN_ATTEMPTS:
        return 0
    elapsed = _seconds_since(user.last_failed_login_at, now)
    if elapsed is None:
        return 0
    overage = attempts - FREE_LOGIN_ATTEMPTS
    wait = min(LOGIN_BASE_WAIT_SECONDS * (2 ** (overage - 1)), LOGIN_MAX_WAIT_SECONDS)
    return max(0, int(round(wait - elapsed)))


def register_failed_login(db: Session, user: User) -> None:
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    user.last_failed_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)


def register_successful_login(db: Session, user: User) -> None:
    if user.failed_login_attempts or user.last_failed_login_at:
        user.failed_login_attempts = 0
        user.last_failed_login_at = None
        db.commit()
        db.refresh(user)


def recovery_cooldown_seconds_remaining(user: User, now: Optional[datetime] = None) -> int:
    elapsed = _seconds_since(user.last_recovery_sent_at, now)
    if elapsed is None:
        return 0
    return max(0, int(round(RECOVERY_COOLDOWN_SECONDS - elapsed)))


def register_recovery_sent(db: Session, user: User) -> None:
    user.last_recovery_sent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
