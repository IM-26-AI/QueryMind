# backend/schemas.py
from pydantic import BaseModel

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

# --- User Schemas ---

# Base schema with shared fields
class UserBase(BaseModel):
    email: str
    full_name: str | None = None

# Schema for CREATING a user (includes password)
class UserCreate(UserBase):
    password: str

# Schema for READING a user (excludes password)
class UserResponse(UserBase):
    id: int
    is_active: bool

    # This is crucial for validting against SQLAlchemy models
    class Config:
        from_attributes = True