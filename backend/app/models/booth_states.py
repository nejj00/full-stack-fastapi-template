from __future__ import annotations

from typing import Optional

from sqlmodel import Field, SQLModel


class BoothStateBase(SQLModel):
    name: str
    description: Optional[str] = None


class BoothState(BoothStateBase, table=True):
    __tablename__: str = "booth_states"

    id: int = Field(primary_key=True)
    name: str
    description: Optional[str] = None


class BoothStateCreate(BoothStateBase):
    id: int


class BoothStateRead(BoothStateBase):
    id: int
