from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class RoleBase(SQLModel):
    name: str
    description: Optional[str] = None


class Role(RoleBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RoleCreate(RoleBase):
    pass


class RoleRead(RoleBase):
    id: uuid.UUID
    created_at: datetime
