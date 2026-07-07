from pydantic import BaseModel
from typing import Optional
from datetime import date


class PeriodOut(BaseModel):
    start: date
    end: Optional[date] = None
