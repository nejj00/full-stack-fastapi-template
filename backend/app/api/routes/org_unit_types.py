from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.org_unit_types import OrgUnitType, OrgUnitTypeCreate, OrgUnitTypeRead
from app.models.general_models import Message

router = APIRouter(prefix="/org-unit-types", tags=["org_unit_types"]) 


@router.get("/", response_model=List[OrgUnitTypeRead])
def read_org_unit_types(session: SessionDep) -> Any:
    statement = select(OrgUnitType)
    types = session.exec(statement).all()
    return types


@router.get("/{id}", response_model=OrgUnitTypeRead)
def read_org_unit_type(session: SessionDep, id: int) -> Any:
    t = session.get(OrgUnitType, id)
    if not t:
        raise HTTPException(status_code=404, detail="Org unit type not found")
    return t


@router.post("/", response_model=OrgUnitTypeRead, status_code=status.HTTP_201_CREATED)
def create_org_unit_type(*, session: SessionDep, current_user: CurrentUser, type_in: OrgUnitTypeCreate) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    t = OrgUnitType.model_validate(type_in)
    session.add(t)
    session.commit()
    session.refresh(t)
    return t


@router.put("/{id}", response_model=OrgUnitTypeRead)
def update_org_unit_type(*, session: SessionDep, current_user: CurrentUser, id: int, type_in: OrgUnitTypeCreate) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    t = session.get(OrgUnitType, id)
    if not t:
        raise HTTPException(status_code=404, detail="Org unit type not found")
    update_data = type_in.model_dump(exclude_unset=True)
    t.sqlmodel_update(update_data)
    session.add(t)
    session.commit()
    session.refresh(t)
    return t


@router.delete("/{id}", response_model=Message)
def delete_org_unit_type(session: SessionDep, current_user: CurrentUser, id: int) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    t = session.get(OrgUnitType, id)
    if not t:
        raise HTTPException(status_code=404, detail="Org unit type not found")
    session.delete(t)
    session.commit()
    return Message(message="Org unit type deleted successfully")
