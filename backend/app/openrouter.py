import asyncio
import httpx
import json
import logging
from typing import AsyncGenerator
from app.config import get_settings

logger = logging.getLogger("openrouter")

class OpenRouterError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message
        super().__init__(f"OpenRouter {status}: {message}")

async def _stream_once(messages: list[dict], model: str) -> AsyncGenerator[str, None]:
    settings = get_settings()
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.allowed_origins.split(",")[0],
        "X-Title": "Generic AI Chatbot",
    }
    payload = {"model": model, "messages": messages, "stream": True, "max_tokens": 1024}

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST", f"{settings.openrouter_base_url}/chat/completions",
            headers=headers, json=payload,
        ) as response:
            if response.status_code != 200:
                body = (await response.aread()).decode(errors="replace")
                logger.error("OpenRouter %s on %s: %s", response.status_code, model, body[:500])
                raise OpenRouterError(response.status_code, body)

            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data = line[6:].strip()
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                except json.JSONDecodeError:
                    continue

                if "error" in chunk:
                    err = chunk["error"]
                    logger.error("Mid-stream error on %s: %s", model, err)
                    raise OpenRouterError(err.get("code", 500), err.get("message", "stream error"))

                try:
                    delta = chunk["choices"][0]["delta"].get("content", "")
                except (KeyError, IndexError):
                    continue
                if delta:
                    yield delta


async def stream_chat(messages: list[dict], model: str | None = None) -> AsyncGenerator[str, None]:
    settings = get_settings()
    primary = model or settings.openrouter_model
    fallbacks = [m.strip() for m in settings.openrouter_fallbacks.split(",") if m.strip()]
    candidates = [primary] + [m for m in fallbacks if m != primary]

    last_err: OpenRouterError | None = None
    for i, candidate in enumerate(candidates):
        try:
            async for chunk in _stream_once(messages, candidate):
                yield chunk
            return  # success
        except OpenRouterError as e:
            last_err = e
            if e.status in (429, 502, 503, 504) and i < len(candidates) - 1:
                await asyncio.sleep(1.5 * (i + 1))
                continue
            raise

    if last_err:
        raise last_err