import asyncio
from typing import Callable, List
from app.core.logging_config import logger

class SDNEventListener:
    """Simulates or streams asynchronous OpenFlow control events to WebSocket subscribers."""
    def __init__(self):
        self.subscribers: List[Callable] = []

    def subscribe(self, callback: Callable):
        self.subscribers.append(callback)

    async def broadcast(self, event_data: dict):
        for sub in self.subscribers:
            try:
                await sub(event_data)
            except Exception as e:
                logger.error(f"Error broadcasting SDN event: {e}")

sdn_event_listener = SDNEventListener()
