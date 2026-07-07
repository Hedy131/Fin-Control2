from pydantic import BaseModel
from typing import Optional

from app.models.category import CategoryType


class CategoryBase(BaseModel):
    name: str
    type: CategoryType
    color: str = "#6366f1"
    icon: str = "tag"


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[CategoryType] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryOut(CategoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
