import secrets

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserUpdate

DEFAULT_USER_EMAIL = "owner@fincontrol.local"


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
