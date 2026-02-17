from __future__ import annotations

import json
from typing import TypedDict

from openai import OpenAI

from .config import settings


class ThreatResult(TypedDict):
    severity: str
    confidence: str
    rationale: str


def _fallback_assessment(description: str) -> ThreatResult:
    lowered = description.lower()
    if any(token in lowered for token in ["ransomware", "exfiltration", "domain admin", "c2"]):
        return {
            "severity": "critical",
            "confidence": "medium",
            "rationale": "Keyword heuristic detected high-impact threat indicators.",
        }
    if any(token in lowered for token in ["phishing", "malware", "lateral movement"]):
        return {
            "severity": "high",
            "confidence": "medium",
            "rationale": "Heuristic rules matched known suspicious behavior.",
        }
    return {
        "severity": "medium",
        "confidence": "low",
        "rationale": "Insufficient signal for elevated severity; defaulting to medium.",
    }


def analyze_threat(description: str) -> ThreatResult:
    if not settings.openai_api_key:
        return _fallback_assessment(description)

    client = OpenAI(api_key=settings.openai_api_key)
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are a SOC analyst. Return JSON with severity, confidence, rationale.",
            },
            {"role": "user", "content": f"Assess this incident: {description}"},
        ],
    )
    content = completion.choices[0].message.content or "{}"
    parsed = json.loads(content)
    return {
        "severity": parsed.get("severity", "medium"),
        "confidence": parsed.get("confidence", "low"),
        "rationale": parsed.get("rationale", "AI response missing rationale."),
    }
