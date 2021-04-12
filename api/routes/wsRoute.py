from typing import List, Union
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from .auth import parseToken
import json

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.admins: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.admins:
            self.leave_admin(websocket)
        self.active_connections.remove(websocket)

    def join_admin(self, websocket: WebSocket):
        self.admins.append(websocket)

    def leave_admin(self, websocket: WebSocket):
        self.admins.remove(websocket)

    async def send_message(self, message: Union[str, dict], websocket: WebSocket):
        if isinstance(message, dict):
            message = json.dumps(message)
        await websocket.send_text(message)

    async def broadcast(self, message: Union[str, dict]):
        if isinstance(message, dict):
            message = json.dumps(message)
        for connection in self.admins:
            await connection.send_text(message)


manager = ConnectionManager()


@router.websocket("/admin/ws")
async def websocket_endpoint(
    websocket: WebSocket,
):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data.startswith("checkAdmin: "):
                try:
                    username, isAdmin = parseToken(data[12:])
                    if isAdmin:
                        manager.join_admin(websocket)
                        await manager.send_message({"error": False, "code": 202, "i18n": "connected"}, websocket)
                    else:
                        raise HTTPException(403, "authFailed")
                except HTTPException as e:
                    await manager.send_message({"error": True, "code": e.status_code, "i18n": e.detail}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("disconnected")