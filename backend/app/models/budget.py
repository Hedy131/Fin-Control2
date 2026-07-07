from sqlalchemy import Column, Integer, Float, ForeignKey, Date, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("user_id", "category_id", "period_start", name="uq_budget_user_category_period"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    period_start = Column(Date, nullable=False)

    owner = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")
