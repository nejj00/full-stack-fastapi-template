from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.booth_states import BoothState, BoothStateCreate, BoothStateRead
from app.models.general_models import Message

router = APIRouter(prefix="/booth-states", tags=["booth_states"]) 


@router.get("/", response_model=List[BoothStateRead])
def read_booth_states(session: SessionDep) -> Any:
    statement = select(BoothState)
    states = session.exec(statement).all()
    return states


@router.get("/{id}", response_model=BoothStateRead)
def read_booth_state(session: SessionDep, id: int) -> Any:
    state = session.get(BoothState, id)
    if not state:
        raise HTTPException(status_code=404, detail="Booth state not found")
    return state


@router.post("/", response_model=BoothStateRead, status_code=status.HTTP_201_CREATED)
def create_booth_state(*, session: SessionDep, current_user: CurrentUser, state_in: BoothStateCreate) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    state = BoothState.model_validate(state_in)
    session.add(state)
    session.commit()
    session.refresh(state)
    return state


@router.put("/{id}", response_model=BoothStateRead)
def update_booth_state(*, session: SessionDep, current_user: CurrentUser, id: int, state_in: BoothStateCreate) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    state = session.get(BoothState, id)
    if not state:
        raise HTTPException(status_code=404, detail="Booth state not found")
    update_data = state_in.model_dump(exclude_unset=True)
    state.sqlmodel_update(update_data)
    session.add(state)
    session.commit()
    session.refresh(state)
    return state


@router.delete("/{id}", response_model=Message)
def delete_booth_state(session: SessionDep, current_user: CurrentUser, id: int) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    state = session.get(BoothState, id)
    if not state:
        raise HTTPException(status_code=404, detail="Booth state not found")
    session.delete(state)
    session.commit()
    return Message(message="Booth state deleted successfully")
