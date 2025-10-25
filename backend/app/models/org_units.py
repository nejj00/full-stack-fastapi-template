from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class OrgUnitBase(SQLModel):
    name: str
    type: Optional[str] = None
    timezone: Optional[str] = None


class OrgUnit(OrgUnitBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="client.id")
    parent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="orgunit.id")
    name: str
    type: Optional[str] = None
    timezone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class OrgUnitCreate(OrgUnitBase):
    client_id: uuid.UUID
    parent_id: Optional[uuid.UUID] = None


class OrgUnitRead(OrgUnitBase):
    id: uuid.UUID
    client_id: uuid.UUID
    parent_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
