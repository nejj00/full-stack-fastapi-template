from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class ClientBase(SQLModel):
    name: str


class Client(ClientBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ClientCreate(ClientBase):
    pass


class ClientRead(ClientBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
