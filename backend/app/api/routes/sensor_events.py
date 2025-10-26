import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.sensor_events import SensorEvent, SensorEventCreate, SensorEventRead
from app.models.general_models import Message

router = APIRouter(prefix="/sensor-events", tags=["sensor_events"]) 


@router.get("/", response_model=List[SensorEventRead])
def read_sensor_events(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    if current_user.is_superuser:
        statement = select(SensorEvent)
    else:
        if not current_user.client_id:
            return []
        statement = select(SensorEvent).where(SensorEvent.client_id == current_user.client_id)
    statement = statement.offset(skip).limit(limit)
    events = session.exec(statement).all()
    return events


@router.get("/{id}", response_model=SensorEventRead)
def read_sensor_event(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    event = session.get(SensorEvent, id)
    if not event:
        raise HTTPException(status_code=404, detail="Sensor event not found")
    if not current_user.is_superuser and event.client_id != current_user.client_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return event


@router.post("/", response_model=SensorEventRead, status_code=status.HTTP_201_CREATED)
def create_sensor_event(*, session: SessionDep, current_user: CurrentUser, event_in: SensorEventCreate) -> Any:
    # allow creation if user belongs to same client (or sup)
    if not current_user.is_superuser and event_in.client_id != current_user.client_id:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    event = SensorEvent.model_validate(event_in)
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.delete("/{id}", response_model=Message)
def delete_sensor_event(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    event = session.get(SensorEvent, id)
    if not event:
        raise HTTPException(status_code=404, detail="Sensor event not found")
    if not current_user.is_superuser and event.client_id != current_user.client_id:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    session.delete(event)
    session.commit()
    return Message(message="Sensor event deleted successfully")
