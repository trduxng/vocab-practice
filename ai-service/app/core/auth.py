from fastapi import Header, HTTPException, status

from app.core.settings import get_settings


async def require_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    settings = get_settings()
    if not settings.ai_internal_token:
        return

    if x_internal_token != settings.ai_internal_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid internal token")
