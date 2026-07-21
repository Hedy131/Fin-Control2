from sqlalchemy import Column, Integer, Float, ForeignKey, Enum, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.currency import Currency


class InvestmentPosition(Base):
    __tablename__ = "investment_positions"
    __table_args__ = (
        UniqueConstraint("user_id", "category_id", name="uq_investment_position_user_category"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    currency = Column(Enum(Currency), nullable=False, default=Currency.AOA)
    initial_invested_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="investment_positions")
    category = relationship("Category", back_populates="investment_positions")
