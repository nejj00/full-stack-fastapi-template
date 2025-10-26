from sqlmodel import Field, Relationship, SQLModel


# Generic message
class Message(SQLModel):
    message: str