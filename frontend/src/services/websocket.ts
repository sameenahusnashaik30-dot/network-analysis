import { APP_CONFIG } from '../utils/constants';

export type WebSocketEventType =
  | 'FLOW_UPDATE'
  | 'ALERT_CREATED'
  | 'UNKNOWN_ATTACK'
  | 'CONTROLLER_EVENT'
  | 'MITIGATION_RESULT'
  | 'SYSTEM_STATUS';

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
  timestamp: string;
}

type Listener = (msg: WebSocketMessage) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private reconnectInterval: number = 5000;
  private isConnecting: boolean = false;
  private isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  public connect(): void {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(APP_CONFIG.wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        console.log('[SENTINEL-X WS] Connected to live WebSocket');
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (e) {
          console.error('[SENTINEL-X WS] Failed to parse message', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.socket.onerror = () => {
        this.isConnecting = false;
        // Silent fallback in demo mode
      };
    } catch {
      this.isConnecting = false;
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(msg: WebSocketMessage): void {
    this.listeners.forEach((fn) => {
      try {
        fn(msg);
      } catch (err) {
        console.error('Error in WS subscriber callback:', err);
      }
    });
  }

  public getStatus(): { isConnected: boolean } {
    return { isConnected: this.isConnected };
  }
}

export const wsService = new WebSocketService();
