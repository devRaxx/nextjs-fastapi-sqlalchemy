from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, status

from api.models import Workout
from api.deps import db_dependency, user_dependency

router = APIRouter(
    prefix="/workouts",
    tags=["workouts"],
)

class WorkoutBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkoutCreate(WorkoutBase):
    pass

@router.get("/{workout_id}")
def get_workout(workout_id: int, db: db_dependency, user: user_dependency):
    return db.query(Workout).filter(Workout.id == workout_id).first()

@router.get("/")
def get_workouts(db: db_dependency, user: user_dependency):
    return db.query(Workout).all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_workout(workout: WorkoutCreate, db: db_dependency, user: user_dependency):
    db_workout = Workout(**workout.model_dump(), user_id=user.get('id'))
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout

@router.delete("/{workout_id}")
def delete_workout(workout_id: int, db: db_dependency, user: user_dependency):
    db_workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not db_workout:
        return {"message": "Workout not found"}
    db.delete(db_workout)
    db.commit()
    return {"message": "Workout deleted"}
