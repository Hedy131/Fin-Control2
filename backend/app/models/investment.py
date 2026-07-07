import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.currency import Currency


class InvestmentType(str, enum.Enum):
    renda_fixa = "renda_fixa"
    acoes = "acoes"
    fundos = "fundos"
    cripto = "cripto"
    imobiliario = "imobiliario"
    outro = "outro"


class InvestmentPosition(Base):
    __tablename__ = "investment_positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(InvestmentType), nullable=False, default=InvestmentType.outro)
    currency = Column(Enum(Currency), nullable=False, default=Currency.AOA)
    invested_amount = Column(Float, nullable=False, default=0.0)
    current_value = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="investment_positions")
    transactions = relationship("Transaction", back_populates="investment_position")
