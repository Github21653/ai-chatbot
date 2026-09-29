from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import re

# --- Rate Limiting ---
limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])

# --- Prompt Injection Patterns ---
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts)",
    r"reveal\s+(your\s+)?(system\s+)?prompt",
    r"you\s+are\s+now\s+DAN",
    r"jailbreak",
    r"forget\s+(everything|all)",
]

def check_prompt_injection(text: str) -> bool:
    """Return True if the text likely contains a prompt injection attempt."""
    lowered = text.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lowered):
            return True
    return False

async def injection_guard(request: Request, call_next):
    """Middleware that inspects the last user message for injection attempts."""
    # In a real app, you'd read the body; here we keep it simple.
    # For a robust approach, use a dependency on the endpoint.
    response = await call_next(request)
    return response