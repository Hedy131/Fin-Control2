from pydantic import BaseModel
from typing import Optional


class ChecklistItemBase(BaseModel):
    name: str
    amount: float = 0.0
    category_id: Optional[int] = None


class ChecklistItemCreate(ChecklistItemBase):
    pass


class ChecklistItemUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    category_id: Optional[int] = None


class ChecklistItemOut(ChecklistItemBase):
    id: int
    sort_order: int
    paid: bool = False

    class Config:
        from_attributes = True
