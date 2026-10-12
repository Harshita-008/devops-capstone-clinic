from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import Base
from ..errors import NotFoundError
from ..models import Appointment


def get_or_404[ModelT: Base](db: Session, model: type[ModelT], obj_id: int, **get_options: Any) -> ModelT:
    obj = db.get(model, obj_id, **get_options)
    if obj is None:
        raise NotFoundError(f"{model.__name__} not found")
    return obj


def save[ModelT: Base](db: Session, obj: ModelT) -> ModelT:
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def apply_changes[ModelT: Base](db: Session, obj: ModelT, changes: dict[str, Any]) -> ModelT:
    for key, value in changes.items():
        setattr(obj, key, value)
    return save(db, obj)


def count_appointments(db: Session, **filters: int) -> int:
    query = select(func.count(Appointment.id)).filter_by(**filters)
    return db.scalar(query) or 0
