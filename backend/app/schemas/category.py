from pydantic import BaseModel, model_validator
from typing import List, Optional

from app.models.enums import TransactionType


class CategoryBase(BaseModel):
    name: str
    types: List[TransactionType]
    is_salary: bool = False
    color: str = "#6366f1"
    icon: str = "tag"

    @model_validator(mode="after")
    def check_types_and_salary_flag(self):
        if not self.types:
            raise ValueError("a categoria precisa de pelo menos um tipo")
        if self.is_salary and TransactionType.income not in self.types:
            raise ValueError("is_salary requer que 'income' esteja entre os tipos da categoria")
        return self


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    types: Optional[List[TransactionType]] = None
    is_salary: Optional[bool] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryOut(CategoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
