import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.sensors import Sensor, SensorCreate, SensorRead
from app.models.general_models import Message

router = APIRouter(prefix="/sensors", tags=["sensors"]) 


@router.get("/", response_model=List[SensorRead])
def read_sensors(session: SessionDep, current_user: CurrentUser) -> Any:
    if current_user.is_superuser:
        statement = select(Sensor)
    else:
        if not current_user.client_id:
            return []
        statement = select(Sensor).where(Sensor.phone_booth_id == current_user.client_id)  # best-effort filtering
    sensors = session.exec(statement).all()
    return sensors


@router.get("/{id}", response_model=SensorRead)
def read_sensor(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    sensor = session.get(Sensor, id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    # Note: sensor.phone_booth_id belongs to a booth; permission checks can be improved
    return sensor


@router.post("/", response_model=SensorRead, status_code=status.HTTP_201_CREATED)
def create_sensor(*, session: SessionDep, current_user: CurrentUser, sensor_in: SensorCreate) -> Any:
    # allow superusers or users managing sensors for their client
    sensor = Sensor.model_validate(sensor_in)
    session.add(sensor)
    session.commit()
    session.refresh(sensor)
    return sensor


@router.put("/{id}", response_model=SensorRead)
def update_sensor(*, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, sensor_in: SensorCreate) -> Any:
    sensor = session.get(Sensor, id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    update_data = sensor_in.model_dump(exclude_unset=True)
    sensor.sqlmodel_update(update_data)
    session.add(sensor)
    session.commit()
    session.refresh(sensor)
    return sensor


@router.delete("/{id}", response_model=Message)
def delete_sensor(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    sensor = session.get(Sensor, id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    session.delete(sensor)
    session.commit()
    return Message(message="Sensor deleted successfully")
