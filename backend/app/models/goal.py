from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Enum, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.currency import Currency


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    currency = Column(Enum(Currency), nullable=False, default=Currency.AOA)
    target_date = Column(Date, nullable=True)
    linked_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    manual_current_amount = Column(Float, nullable=True)
    color = Column(String, default="#6366f1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="goals")
    linked_account = relationship("Account")
