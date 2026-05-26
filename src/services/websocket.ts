// Sentinel WebSocket Service for Real-time map updates

class WebSocketService {
  private ws: WebSocket | null = null;

  connect(_token: string) {
    // const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    // this.ws = new WebSocket(`${WS_URL}?token=${token}`);
    
    // this.ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'NEW_HAZARD') {
    //     // Dispatch event to MapScreen/Pulse
    //     window.dispatchEvent(new CustomEvent('sentinel:new_hazard', { detail: data.payload }));
    //   }
    // };
    console.log('Mock WS connected');
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketService();
