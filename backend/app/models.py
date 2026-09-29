from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class Message(BaseModel):
    role: str = Field(..., pattern ="^(user|assistant|system)$" )
    content: str = Field(..., min_length=1, max_length=4000)

class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., min_length=1, max_length=20)
    model: Optional[str] = None

    @field_validator("messages")
    @classmethod
    def messages_not_empty(cls, v: List[Message]) -> List[Message]:
        if not v:
            raise ValueError("At least one message is required")
        return v
    
class ChatResponse(BaseModel):
    content: str 
    model: str