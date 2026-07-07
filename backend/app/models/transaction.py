from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import TransactionType, transaction_type_enum

__all__ = ["Transaction", "TransactionType"]


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    destination_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    investment_position_id = Column(Integer, ForeignKey("investment_positions.id"), nullable=True)
    type = Column(transaction_type_enum, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="transactions")
    account = relationship("Account", foreign_keys=[account_id], back_populates="transactions")
    destination_account = relationship("Account", foreign_keys=[destination_account_id])
    category = relationship("Category", back_populates="transactions")
    investment_position = relationship("InvestmentPosition", back_populates="transactions")
