from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional, Any

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class SensorEventBase(SQLModel):
    state_id: int
    event_time_utc: datetime
    raw_payload: Optional[dict] = None


class SensorEvent(SensorEventBase, table=True):
    __tablename__: str = "sensor_events"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    sensor_id: uuid.UUID = Field(foreign_key="sensor.id")
    phone_booth_id: uuid.UUID = Field(foreign_key="phonebooth.id")
    client_id: uuid.UUID = Field(foreign_key="client.id")
    org_unit_id: uuid.UUID = Field(foreign_key="orgunit.id")
    state_id: int
    event_time_utc: datetime
    received_at: datetime = Field(default_factory=datetime.utcnow)
    raw_payload: Optional[dict] = Field(default=None, sa_column=Column(JSONB))


class SensorEventCreate(SensorEventBase):
    sensor_id: uuid.UUID
    phone_booth_id: uuid.UUID
    client_id: uuid.UUID
    org_unit_id: uuid.UUID


class SensorEventRead(SensorEventBase):
    id: uuid.UUID
    sensor_id: uuid.UUID
    phone_booth_id: uuid.UUID
    client_id: uuid.UUID
    org_unit_id: uuid.UUID
    received_at: datetime
