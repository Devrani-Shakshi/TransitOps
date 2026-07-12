import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private reconnectInterval = 1000;
  private maxReconnectInterval = 30000;
  private reconnectAttempts = 0;
  
  // Writable Signals for broadcast streams
  kpiUpdates = signal<any>(null);
  tripUpdates = signal<any>(null);

  constructor() {}

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    let wsUrl = environment.wsUrl;
    if (environment.production || !wsUrl) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/api/v1/ws/dashboard`;
    }

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket Connection Opened');
        this.reconnectInterval = 1000;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'KPI_DELTA') {
            this.kpiUpdates.set(payload.data);
          } else if (payload.type === 'TRIP_STATUS_CHANGE') {
            this.tripUpdates.set(payload.data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message', err);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket Connection Closed. Reason: ${event.reason}. Reconnecting...`);
        this.socket = null;
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Error', error);
      };
    } catch (e) {
      console.error('Failed to create WebSocket instance', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectInterval
    );
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open. Cannot send message:', message);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
