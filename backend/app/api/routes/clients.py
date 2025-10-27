import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.clients import Client, ClientCreate, ClientRead
from app.models.general_models import Message

router = APIRouter(prefix="/clients", tags=["clients"]) 


@router.get("/", response_model=List[ClientRead])
def read_clients(session: SessionDep, current_user: CurrentUser) -> Any:
    """Return list of clients. Superusers see all."""
    if current_user.is_superuser:
        statement = select(Client)
    else:
        # Non-superusers only see their own client (if set)
        if not current_user.client_id:
            return []
        statement = select(Client).where(Client.id == current_user.client_id)
    clients = session.exec(statement).all()
    return clients


@router.get("/{id}", response_model=ClientRead)
def read_client(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    client = session.get(Client, id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if not current_user.is_superuser and current_user.client_id != client.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return client


@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(*, session: SessionDep, current_user: CurrentUser, client_in: ClientCreate) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    client = Client.model_validate(client_in)
    session.add(client)
    session.commit()
    session.refresh(client)
    return client


@router.put("/{id}", response_model=ClientRead)
def update_client(*, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, client_in: ClientCreate) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    client = session.get(Client, id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    update_data = client_in.model_dump(exclude_unset=True)
    client.sqlmodel_update(update_data)
    session.add(client)
    session.commit()
    session.refresh(client)
    return client


@router.delete("/{id}", response_model=Message)
def delete_client(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    client = session.get(Client, id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    session.delete(client)
    session.commit()
    return Message(message="Client deleted successfully")
