import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.roles import Role, RoleCreate, RoleRead
from app.models.general_models import Message

router = APIRouter(prefix="/roles", tags=["roles"]) 


@router.get("/", response_model=List[RoleRead])
def read_roles(session: SessionDep) -> Any:
    statement = select(Role)
    roles = session.exec(statement).all()
    return roles


@router.get("/{id}", response_model=RoleRead)
def read_role(session: SessionDep, id: uuid.UUID) -> Any:
    role = session.get(Role, id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.post("/", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
def create_role(*, session: SessionDep, current_user: CurrentUser, role_in: RoleCreate) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    role = Role.model_validate(role_in)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


@router.put("/{id}", response_model=RoleRead)
def update_role(*, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, role_in: RoleCreate) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    role = session.get(Role, id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    update_data = role_in.model_dump(exclude_unset=True)
    role.sqlmodel_update(update_data)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


@router.delete("/{id}", response_model=Message)
def delete_role(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    role = session.get(Role, id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    session.delete(role)
    session.commit()
    return Message(message="Role deleted successfully")
