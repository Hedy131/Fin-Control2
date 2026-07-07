from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PinLogin(BaseModel):
    pin: str = Field(..., pattern=r"^\d{4}$")
