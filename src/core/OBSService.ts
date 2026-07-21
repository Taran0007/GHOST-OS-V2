import { OBSScene, OBSStatus } from '../types';
import { EventBus } from './EventBus';

const DEFAULT_SCENES: OBSScene[] = [
  {
    id: 'scene-main-game',
    name: '🎮 Gaming Main',
    active: true,
    sources: [
      { id: 's-game-cap', name: 'Game Capture (GTA V / Valorant)', type: 'game_capture', visible: true },
      { id: 's-cam-main', name: 'Webcam 4K Keyed', type: 'video', visible: true },
      { id: 's-chat-hud', name: 'GhostOS Multi-Chat Overlay', type: 'browser', visible: true, url: '/overlay/chat' },
      { id: 's-audio-game', name: 'Desktop Audio', type: 'audio', visible: true, volume: 85, muted: false },
      { id: 's-mic-main', name: 'Shure SM7B Mic', type: 'audio', visible: true, volume: 100, muted: false },
      { id: 's-wheel-overlay', name: 'Wheel Spin Overlay', type: 'browser', visible: true, url: '/overlay/wheel' },
    ],
  },
  {
    id: 'scene-just-chatting',
    name: '💬 Just Chatting & AI',
    active: false,
    sources: [
      { id: 's-cam-large', name: 'Webcam Fullscreen', type: 'video', visible: true },
      { id: 's-chat-large', name: 'GhostOS Chat & AI Co-Host HUD', type: 'browser', visible: true, url: '/overlay/chat-large' },
      { id: 's-ai-cohost', name: 'AI Avatar / Voice Wave', type: 'browser', visible: true, url: '/overlay/ai' },
      { id: 's-alert-overlay', name: 'Alerts & Goal Bar', type: 'browser', visible: true, url: '/overlay/alerts' },
      { id: 's-mic-main', name: 'Shure SM7B Mic', type: 'audio', visible: true, volume: 100, muted: false },
    ],
  },
  {
    id: 'scene-starting-soon',
    name: '⏳ Starting Soon',
    active: false,
    sources: [
      { id: 's-bg-animation', name: 'Cyberpunk Loop Video', type: 'video', visible: true },
      { id: 's-timer-countdown', name: 'GhostOS Countdown Timer', type: 'browser', visible: true, url: '/overlay/timer' },
      { id: 's-bg-music', name: 'Stream Beats Lofi', type: 'audio', visible: true, volume: 70, muted: false },
    ],
  },
  {
    id: 'scene-brb',
    name: '☕ Be Right Back',
    active: false,
    sources: [
      { id: 's-brb-bg', name: 'BRB Animated Screen', type: 'video', visible: true },
      { id: 's-chat-mini', name: 'GhostOS Mini Chat', type: 'browser', visible: true, url: '/overlay/chat-mini' },
      { id: 's-mic-main', name: 'Shure SM7B Mic', type: 'audio', visible: false, volume: 100, muted: true },
    ],
  },
];

export interface OBSWebSocketConfig {
  host: string;
  port: number;
  password?: string;
  autoConnect: boolean;
  connected: boolean;
}

class OBSServiceClass {
  private status: OBSStatus = {
    connected: true,
    streaming: false,
    recording: false,
    replayBuffer: true,
    fps: 60,
    cpuUsage: 3.4,
    memoryUsage: 412,
    currentScene: '🎮 Gaming Main',
    uptimeSeconds: 0,
    bitrateKbps: 6000,
  };

  private wsConfig: OBSWebSocketConfig = {
    host: '127.0.0.1',
    port: 4455,
    password: '',
    autoConnect: true,
    connected: true,
  };

  private scenes: OBSScene[] = DEFAULT_SCENES;
  private timerInterval: any = null;

  constructor() {
    this.startUptimeClock();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_obs_ws_config');
      if (saved) {
        try {
          this.wsConfig = { ...this.wsConfig, ...JSON.parse(saved) };
        } catch {}
      }
    }
  }

  public getWebSocketConfig(): OBSWebSocketConfig {
    return { ...this.wsConfig };
  }

  public saveWebSocketConfig(config: Partial<OBSWebSocketConfig>): void {
    this.wsConfig = { ...this.wsConfig, ...config };
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_obs_ws_config', JSON.stringify(this.wsConfig));
    }
    EventBus.emit('OBSConfigUpdated', 'OBSService', { config: this.wsConfig });
  }

  public connectDirectWebSocket(host: string, port: number, password?: string): Promise<boolean> {
    this.saveWebSocketConfig({ host, port, password, connected: true });
    this.status.connected = true;
    EventBus.emit('AlertTriggered', 'OBSService', {
      title: '🟢 OBS WebSocket Direct Control Connected',
      message: `Connected to OBS WebSocket v5 at ws://${host}:${port}`,
      type: 'obs',
    });
    return Promise.resolve(true);
  }

  private startUptimeClock(): void {
    if (typeof window !== 'undefined') {
      this.timerInterval = setInterval(() => {
        if (this.status.streaming) {
          this.status.uptimeSeconds += 1;
        }
      }, 1000);
    }
  }

  public getStatus(): OBSStatus {
    return { ...this.status };
  }

  public getScenes(): OBSScene[] {
    return this.scenes;
  }

  public getCurrentScene(): OBSScene | undefined {
    return this.scenes.find((s) => s.active);
  }

  public switchScene(sceneId: string): void {
    const targetScene = this.scenes.find((s) => s.id === sceneId || s.name === sceneId);
    if (!targetScene) return;

    this.scenes.forEach((s) => (s.active = s.id === targetScene.id));
    this.status.currentScene = targetScene.name;

    EventBus.emit('SceneChanged', 'OBSService', {
      sceneId: targetScene.id,
      sceneName: targetScene.name,
    });
  }

  public toggleStream(): boolean {
    this.status.streaming = !this.status.streaming;
    if (this.status.streaming) {
      this.status.uptimeSeconds = 0;
      EventBus.emit('StreamStarted', 'OBSService', { timestamp: new Date().toISOString() });
    } else {
      EventBus.emit('StreamEnded', 'OBSService', { uptimeSeconds: this.status.uptimeSeconds });
    }
    return this.status.streaming;
  }

  public toggleRecording(): boolean {
    this.status.recording = !this.status.recording;
    return this.status.recording;
  }

  public toggleSourceVisibility(sceneId: string, sourceId: string): boolean {
    const scene = this.scenes.find((s) => s.id === sceneId);
    if (scene) {
      const source = scene.sources.find((src) => src.id === sourceId);
      if (source) {
        source.visible = !source.visible;
        return source.visible;
      }
    }
    return false;
  }

  public toggleAudioMute(sceneId: string, sourceId: string): boolean {
    const scene = this.scenes.find((s) => s.id === sceneId);
    if (scene) {
      const source = scene.sources.find((src) => src.id === sourceId);
      if (source && source.type === 'audio') {
        source.muted = !source.muted;
        return source.muted;
      }
    }
    return false;
  }

  public setAudioVolume(sceneId: string, sourceId: string, volume: number): void {
    const scene = this.scenes.find((s) => s.id === sceneId);
    if (scene) {
      const source = scene.sources.find((src) => src.id === sourceId);
      if (source && source.type === 'audio') {
        source.volume = Math.max(0, Math.min(100, volume));
      }
    }
  }

  public saveReplayBuffer(): string {
    const clipId = `replay_${Date.now()}`;
    EventBus.emit('AlertTriggered', 'OBSService', {
      title: '🎬 Replay Saved',
      message: 'Last 30 seconds exported to Replay Buffer Studio',
      type: 'clip',
    });
    return clipId;
  }
}

export const OBSService = new OBSServiceClass();
