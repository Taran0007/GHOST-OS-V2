import { GhostEvent, EventType } from '../types';

type EventCallback = (event: GhostEvent) => void;

class EventBusService {
  private listeners: Map<EventType | '*', Set<EventCallback>> = new Map();
  private eventHistory: GhostEvent[] = [];
  private maxHistorySize = 200;

  constructor() {
    this.listeners.set('*', new Set());
  }

  public subscribe(eventType: EventType | '*', callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public emit(type: EventType, source: string, payload: any): GhostEvent {
    const event: GhostEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      timestamp: new Date().toISOString(),
      source,
      payload,
    };

    // Keep history
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop();
    }

    // Trigger type-specific listeners
    const specificListeners = this.listeners.get(type);
    if (specificListeners) {
      specificListeners.forEach((cb) => cb(event));
    }

    // Trigger wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((cb) => cb(event));
    }

    return event;
  }

  public getHistory(): GhostEvent[] {
    return [...this.eventHistory];
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}

export const EventBus = new EventBusService();
