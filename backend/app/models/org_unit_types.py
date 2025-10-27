from __future__ import annotations

from typing import Optional

from sqlmodel import Field, SQLModel


class OrgUnitTypeBase(SQLModel):
    name: str
    description: Optional[str] = None


class OrgUnitType(OrgUnitTypeBase, table=True):
    __tablename__: str = "org_unit_types"

    id: int = Field(primary_key=True)
    name: str
    description: Optional[str] = None


class OrgUnitTypeCreate(OrgUnitTypeBase):
    id: int


class OrgUnitTypeRead(OrgUnitTypeBase):
    id: int
