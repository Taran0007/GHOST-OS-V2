import { PluginManifest, PluginStatus } from '../types';
import { EventBus } from './EventBus';

const INITIAL_PLUGINS: PluginManifest[] = [
  {
    id: 'plugin-obs-studio',
    name: 'OBS Studio Core Integrator',
    version: '1.2.0',
    description: 'OBS WebSocket v5 bridge, scene switcher, audio mixer, and replay buffer automation.',
    author: 'GhostOS Team',
    category: 'official',
    icon: 'Video',
    permissions: ['OBS', 'Overlay', 'System'],
    status: 'running',
    memoryUsageMb: 14.2,
    cpuUsagePct: 0.8,
  },
  {
    id: 'plugin-unified-chat',
    name: 'Unified Multi-Chat & Overlay',
    version: '2.0.1',
    description: 'Consolidates Twitch, Kick, YouTube, and Discord chat into one transparent HUD overlay.',
    author: 'GhostOS Team',
    category: 'official',
    icon: 'MessageSquare',
    permissions: ['Chat', 'Overlay', 'Network'],
    status: 'running',
    memoryUsageMb: 22.5,
    cpuUsagePct: 1.2,
  },
  {
    id: 'plugin-ai-companion',
    name: 'AI Co-Host & Director',
    version: '1.5.0',
    description: 'Gemini-powered AI assistant for roast generation, dead-air detection, and chat moderation.',
    author: 'GhostOS Team',
    category: 'official',
    icon: 'Bot',
    permissions: ['AI', 'Chat', 'OBS', 'Notifications'],
    status: 'running',
    memoryUsageMb: 38.1,
    cpuUsagePct: 2.1,
  },
  {
    id: 'plugin-virtual-streamdeck',
    name: 'Virtual Stream Deck & Macros',
    version: '1.1.0',
    description: 'Virtual grid controller for scene shortcuts, sound triggers, and flow automations.',
    author: 'GhostOS Team',
    category: 'official',
    icon: 'Grid',
    permissions: ['OBS', 'Hotkeys', 'Automation'],
    status: 'running',
    memoryUsageMb: 8.6,
    cpuUsagePct: 0.3,
  },
  {
    id: 'plugin-audio-deck',
    name: 'Audio Deck Soundboard',
    version: '1.0.4',
    description: 'Instant soundboard with per-sound volume, hotkeys, and stream output routing.',
    author: 'GhostOS Team',
    category: 'official',
    icon: 'Volume2',
    permissions: ['Microphone', 'Hotkeys', 'System'],
    status: 'running',
    memoryUsageMb: 11.4,
    cpuUsagePct: 0.4,
  },
  {
    id: 'plugin-wheel-studio',
    name: 'Wheel Studio Canvas',
    version: '1.3.0',
    description: 'Weighted interactive prize wheel with particle celebrations and browser source popouts.',
    author: 'GhostOS Team',
    category: 'official',
    icon: 'Disc',
    permissions: ['Overlay', 'Economy', 'Chat'],
    status: 'running',
    memoryUsageMb: 18.9,
    cpuUsagePct: 1.1,
  },
  {
    id: 'plugin-stream-economy',
    name: 'Stream Economy & GTA RP Businesses',
    version: '1.4.2',
    description: 'GTA RP-inspired economy engine with nightclubs, mechanics, jobs, level XP, and inventory.',
    author: 'GhostOS Team',
    category: 'official',
    icon: 'Coins',
    permissions: ['Storage', 'Viewer Data', 'Economy'],
    status: 'running',
    memoryUsageMb: 16.3,
    cpuUsagePct: 0.6,
  },
  {
    id: 'plugin-flow-builder',
    name: 'Visual Flow Automation Builder',
    version: '1.0.0',
    description: 'Node-based visual automation routine designer connecting stream triggers to actions.',
    author: 'GhostOS Team',
    category: 'official',
    icon: 'GitFork',
    permissions: ['Automation', 'Storage', 'System'],
    status: 'running',
    memoryUsageMb: 24.8,
    cpuUsagePct: 1.0,
  },
  {
    id: 'plugin-football-widget',
    name: 'Live Sports Score Ticker',
    version: '0.9.5',
    description: 'Displays real-time football & cricket scores overlay on stream.',
    author: 'SportsDev Community',
    category: 'community',
    icon: 'Trophy',
    permissions: ['Overlay', 'Network'],
    status: 'running',
    memoryUsageMb: 9.1,
    cpuUsagePct: 0.2,
  },
  {
    id: 'plugin-ai-roast-pro',
    name: 'AI Roast & Compliment Engine Pro',
    version: '1.1.0',
    description: 'Customizable roasts with personality presets for Twitch Channel Points redeems.',
    author: 'ProStreamer Labs',
    category: 'premium',
    icon: 'Flame',
    permissions: ['AI', 'Chat', 'Economy'],
    status: 'running',
    memoryUsageMb: 12.0,
    cpuUsagePct: 0.5,
  },
];

class PluginManagerService {
  private plugins: Map<string, PluginManifest> = new Map();

  constructor() {
    INITIAL_PLUGINS.forEach((p) => this.plugins.set(p.id, { ...p }));
  }

  public getAllPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  public getPlugin(id: string): PluginManifest | undefined {
    return this.plugins.get(id);
  }

  public setPluginStatus(id: string, status: PluginStatus): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.status = status;
      EventBus.emit(status === 'running' ? 'PluginLoaded' : status === 'crashed' ? 'PluginCrashed' : 'PluginStopped', 'PluginManager', {
        pluginId: id,
        name: plugin.name,
        status,
      });
    }
  }

  public installPlugin(manifest: PluginManifest): void {
    this.plugins.set(manifest.id, { ...manifest, status: 'running' });
    EventBus.emit('PluginLoaded', 'PluginManager', {
      pluginId: manifest.id,
      name: manifest.name,
    });
  }

  public uninstallPlugin(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      this.plugins.delete(id);
      EventBus.emit('PluginStopped', 'PluginManager', {
        pluginId: id,
        name: plugin.name,
      });
    }
  }

  public recoverCrashedPlugins(): void {
    this.plugins.forEach((plugin) => {
      if (plugin.status === 'crashed') {
        plugin.status = 'running';
        EventBus.emit('PluginLoaded', 'PluginManager', {
          pluginId: plugin.id,
          name: plugin.name,
          recovered: true,
        });
      }
    });
  }
}

export const PluginManager = new PluginManagerService();
