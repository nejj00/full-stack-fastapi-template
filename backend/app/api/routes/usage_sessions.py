import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.usage_sessions import UsageSession, UsageSessionCreate, UsageSessionRead
from app.models.general_models import Message

router = APIRouter(prefix="/usage-sessions", tags=["usage_sessions"]) 


@router.get("/", response_model=List[UsageSessionRead])
def read_usage_sessions(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    if current_user.is_superuser:
        statement = select(UsageSession)
    else:
        if not current_user.client_id:
            return []
        statement = select(UsageSession).where(UsageSession.client_id == current_user.client_id)
    statement = statement.offset(skip).limit(limit)
    sessions = session.exec(statement).all()
    return sessions


@router.get("/{id}", response_model=UsageSessionRead)
def read_usage_session(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    s = session.get(UsageSession, id)
    if not s:
        raise HTTPException(status_code=404, detail="Usage session not found")
    if not current_user.is_superuser and s.client_id != current_user.client_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return s


@router.post("/", response_model=UsageSessionRead, status_code=status.HTTP_201_CREATED)
def create_usage_session(*, session: SessionDep, current_user: CurrentUser, s_in: UsageSessionCreate) -> Any:
    if not current_user.is_superuser and s_in.client_id != current_user.client_id:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    s = UsageSession.model_validate(s_in)
    session.add(s)
    session.commit()
    session.refresh(s)
    return s


@router.delete("/{id}", response_model=Message)
def delete_usage_session(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    s = session.get(UsageSession, id)
    if not s:
        raise HTTPException(status_code=404, detail="Usage session not found")
    if not current_user.is_superuser and s.client_id != current_user.client_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(s)
    session.commit()
    return Message(message="Usage session deleted successfully")
