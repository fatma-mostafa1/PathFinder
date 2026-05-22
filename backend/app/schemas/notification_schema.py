from pydantic import BaseModel


class NotificationReadUpdate(BaseModel):
    is_read: bool = True
