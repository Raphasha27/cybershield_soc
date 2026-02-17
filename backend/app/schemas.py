from datetime import datetime

from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    source: str = Field(default="soc", max_length=100)


class IncidentRead(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    source: str
    timestamp: datetime

    class Config:
        from_attributes = True


class ThreatScoreResponse(BaseModel):
    severity: str
    confidence: str
    rationale: str
