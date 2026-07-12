from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import manager

router = APIRouter()

@router.websocket("/connect/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Keep connection open and handle incoming messages
            data = await websocket.receive_text()
            await websocket.send_text(f"Ack: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)

@router.websocket("/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    await manager.connect(websocket, "dashboard")
    try:
        while True:
            # Just keep connection open so the client can receive updates
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "dashboard")

