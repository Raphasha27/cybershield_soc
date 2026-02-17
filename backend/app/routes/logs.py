import asyncio
from datetime import datetime, timezone
from random import choice

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/logs", tags=["logs"])

SAMPLE_EVENTS = [
    "Firewall denied inbound connection from 203.0.113.55",
    "Suspicious PowerShell execution detected on host FIN-WS-12",
    "Multiple failed login attempts against privileged account",
    "New CVE signature downloaded to endpoint protection",
]


@router.websocket("/stream")
async def stream_logs(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "message": choice(SAMPLE_EVENTS),
                }
            )
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        return
