from pydantic import BaseModel, Field

class UserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=3, max_length=500)

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.\-]+$")
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="user", pattern="^(user|superadmin)$")

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=1, max_length=128)

class UserOut(BaseModel):
    id: int
    username: str
    role: str