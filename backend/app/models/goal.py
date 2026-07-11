from sqlalchemy import Column, Integer, Float, ForeignKey, Date, Enum, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.currency import Currency


class Goal(Base):
    __tablename__ = "goals"
    __table_args__ = (
        UniqueConstraint("user_id", "category_id", name="uq_goal_user_category"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    target_amount = Column(Float, nullable=False, default=0.0)
    currency = Column(Enum(Currency), nullable=False, default=Currency.AOA)
    target_date = Column(Date, nullable=True)
    linked_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    initial_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="goals")
    category = relationship("Category", back_populates="goals")
    linked_account = relationship("Account")
