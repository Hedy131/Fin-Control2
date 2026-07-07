from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserUpdate(BaseModel):
    full_name: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
