from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..ai import analyze_threat
from ..database import get_db
from ..models import Incident
from ..schemas import IncidentCreate, IncidentRead, ThreatScoreResponse

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("", response_model=list[IncidentRead])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.timestamp.desc()).all()


@router.post("", response_model=IncidentRead)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    assessment = analyze_threat(payload.description)
    record = Incident(
        title=payload.title,
        description=payload.description,
        source=payload.source,
        severity=assessment["severity"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/score", response_model=ThreatScoreResponse)
def score_incident(payload: IncidentCreate):
    if not payload.description:
        raise HTTPException(status_code=400, detail="description is required")
    return analyze_threat(payload.description)
