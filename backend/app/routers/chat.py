import json
import logging
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from app.models import ChatRequest
from app.openrouter import stream_chat, OpenRouterError
from app.security import limiter, check_prompt_injection
from app.auth import get_current_user         
from app.db_models import User                
import json, logging

logger = logging.getLogger("chat")
router = APIRouter()


def _friendly_message(status: int) -> str:
    if status == 401:
        return "Server configuration error. Please contact the administrator."
    if status == 402:
        return "The model provider is out of credits. Please try a different model."
    if status == 429:
        return "Rate limit reached. Please wait a few seconds and try again."
    if status in (502, 503, 504):
        return "The model is temporarily busy. Please try again in a moment."
    return "The model service returned an error. Please try again."


@router.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest, user: User = Depends(get_current_user),):
    last_user = next((m for m in reversed(body.messages) if m.role == "user"), None)
    if last_user and check_prompt_injection(last_user.content):
        raise HTTPException(status_code=400, detail="Message blocked by safety filter.")

    messages = [{"role": m.role, "content": m.content} for m in body.messages]

    async def event_generator():
        try:
            async for chunk in stream_chat(messages, model=body.model):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        except OpenRouterError as e:
            yield f"data: {json.dumps({'error': _friendly_message(e.status), 'code': e.status})}\n\n"
        except Exception:
            logger.exception("Unexpected error in chat stream")
            yield f"data: {json.dumps({'error': 'Unexpected server error.'})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")