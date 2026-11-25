import { useEffect, useState } from 'react';
import { wsService, WebSocketMessage } from '../services/websocket';

export function useWebSocket(onMessage?: (msg: WebSocketMessage) => void) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = wsService.subscribe((msg) => {
      setLastMessage(msg);
      if (onMessage) {
        onMessage(msg);
      }
    });

    const interval = setInterval(() => {
      setIsConnected(wsService.getStatus().isConnected);
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [onMessage]);

  return { lastMessage, isConnected };
}
