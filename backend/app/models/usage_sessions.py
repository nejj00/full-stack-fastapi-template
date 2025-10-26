from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class UsageSessionBase(SQLModel):
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None


class UsageSession(UsageSessionBase, table=True):
    __tablename__: str = "usage_sessions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    phone_booth_id: uuid.UUID = Field(foreign_key="phonebooth.id")
    client_id: uuid.UUID = Field(foreign_key="client.id")
    org_unit_id: uuid.UUID = Field(foreign_key="orgunit.id")
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UsageSessionCreate(UsageSessionBase):
    phone_booth_id: uuid.UUID
    client_id: uuid.UUID
    org_unit_id: uuid.UUID


class UsageSessionRead(UsageSessionBase):
    id: uuid.UUID
    phone_booth_id: uuid.UUID
    client_id: uuid.UUID
    org_unit_id: uuid.UUID
    created_at: datetime
