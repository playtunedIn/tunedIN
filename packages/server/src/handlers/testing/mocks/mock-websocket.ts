// MockWebSocket.ts
class MockWebSocket {
  private listeners: Record<string, ((event: MessageEvent) => void)[]>;

  constructor(public url: string) {
    this.listeners = {};
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    const typeListeners = this.listeners[type];
    if (typeListeners) {
      this.listeners[type] = typeListeners.filter(l => l !== listener);
    }
  }

  // Simulate receiving a message from the server
  simulateMessage(message: string) {
    const event = new MessageEvent('message', { data: message });
    const listeners = this.listeners['message'];
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  // ... Add more methods as needed for simulating behavior like connecting, closing, etc.
}

export default MockWebSocket;
