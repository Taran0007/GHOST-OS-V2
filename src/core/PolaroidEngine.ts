import { EventBus } from './EventBus';
import { OBSService } from './OBSService';
import { Platform } from '../types';

export type PolaroidRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'streamer';

export interface PolaroidTheme {
  id: string;
  name: string;
  description: string;
  frameBg: string; // Tailwind or CSS color/gradient
  borderColor: string;
  textColor: string;
  fontFamily: string;
  filterCss?: string;
  badge?: string;
  weight: number;
}

export interface PolaroidRequest {
  id: string;
  username: string;
  platform: Platform;
  triggerSource: 'twitch_reward' | 'chat_command' | 'dashboard' | 'mobile' | 'mod' | 'flow';
  themeId: string;
  rarity: PolaroidRarity;
  timestamp: string;
  dateStr: string;
  timeStr: string;
  status: 'queued' | 'capturing' | 'developing' | 'completed' | 'cancelled';
  imageDataUrl?: string; // Captured canvas snapshot
  customCaption?: string;
}

export interface PolaroidPluginConfig {
  enabled: boolean;
  maxQueueSize: number;
  twitchCommand: string; // default !polaroid
  kickCommand: string;   // default !polaroid
  triggerOnChannelPoints: boolean;
  channelPointRewardName: string;
  discordWebhookUrl: string;
  discordEnabled: boolean;
  discordMessageTemplate: string;
  autoSaveLocal: boolean;
  saveDirectory: string;
  defaultThemeId: string;
  randomThemeMode: boolean;
  rareFramesEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  flashDurationMs: number; // default 300ms
  developDurationMs: number; // default 3500ms
  displayDurationMs: number; // default 4000ms
  chatAnnounce: boolean;
  chatAnnounceTemplate: string;
  // Rarity percentages (must sum near 100)
  rarityOdds: {
    common: number;     // e.g. 70%
    uncommon: number;   // e.g. 20%
    rare: number;       // e.g. 7%
    epic: number;       // e.g. 2.5%
    legendary: number;  // e.g. 0.5%
  };
}

export const DEFAULT_POLAROID_THEMES: PolaroidTheme[] = [
  {
    id: 'classic_white',
    name: 'Classic White',
    description: 'Traditional 1970s analog Polaroid film white border',
    frameBg: '#FDFBF7',
    borderColor: '#E2DCD5',
    textColor: '#2D2B2A',
    fontFamily: 'font-mono',
    filterCss: 'contrast(105%) saturate(110%) sepia(10%)',
    weight: 40,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Dark cyber neon glow with cyan and magenta accents',
    frameBg: 'linear-gradient(135deg, #090d16 0%, #1e1035 100%)',
    borderColor: '#06b6d4',
    textColor: '#22d3ee',
    fontFamily: 'font-mono',
    filterCss: 'contrast(125%) saturate(140%) hue-rotate(-10deg)',
    badge: '⚡ CYBERPUNK 2077',
    weight: 15,
  },
  {
    id: 'vintage_sepia',
    name: 'Vintage 1980s',
    description: 'Warm retro sepia grain with aged paper texture',
    frameBg: '#F4E8D1',
    borderColor: '#D4C4A8',
    textColor: '#5C4328',
    fontFamily: 'font-serif',
    filterCss: 'sepia(40%) contrast(95%) brightness(95%)',
    badge: '📜 VINTAGE FILM',
    weight: 15,
  },
  {
    id: 'ghostos_dark',
    name: 'GhostOS Dark Mode',
    description: 'Sleek matte slate black with cyan laser frame',
    frameBg: '#0f172a',
    borderColor: '#38bdf8',
    textColor: '#f8fafc',
    fontFamily: 'font-sans',
    filterCss: 'contrast(115%) brightness(105%)',
    badge: '👻 GHOSTOS MASTER',
    weight: 10,
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave 90s',
    description: 'Pastel magenta & blue neon gradient with scanlines',
    frameBg: 'linear-gradient(135deg, #f472b6 0%, #818cf8 100%)',
    borderColor: '#f472b6',
    textColor: '#ffffff',
    fontFamily: 'font-mono',
    filterCss: 'saturate(150%) contrast(110%)',
    badge: '🌴 VAPORWAVE',
    weight: 10,
  },
  {
    id: 'gta_vibes',
    name: 'GTA San Andreas',
    description: 'Los Santos sunset gold frame with bold stencil text',
    frameBg: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
    borderColor: '#fbbf24',
    textColor: '#fef3c7',
    fontFamily: 'font-sans font-black',
    filterCss: 'contrast(120%) saturate(130%) warm-tint',
    badge: '⭐ LOS SANTOS',
    weight: 10,
  },
];

const DEFAULT_CONFIG: PolaroidPluginConfig = {
  enabled: true,
  maxQueueSize: 25,
  twitchCommand: '!polaroid',
  kickCommand: '!polaroid',
  triggerOnChannelPoints: true,
  channelPointRewardName: 'Polaroid Stream Snap',
  discordWebhookUrl: 'https://discord.com/api/webhooks/mock_ghostos_polaroid',
  discordEnabled: true,
  discordMessageTemplate: '📸 **New Stream Polaroid Snap!**\nViewer: @{username} ({platform})\nTheme: {theme} [{rarity}]\nDate: {date} at {time}',
  autoSaveLocal: true,
  saveDirectory: 'GhostOS/Media/Polaroids',
  defaultThemeId: 'classic_white',
  randomThemeMode: true,
  rareFramesEnabled: true,
  soundEnabled: true,
  soundVolume: 0.8,
  flashDurationMs: 350,
  developDurationMs: 3500,
  displayDurationMs: 4500,
  chatAnnounce: true,
  chatAnnounceTemplate: '📸 SMILE! @{username} redeemed a {rarity} {theme} Polaroid photo on stream! 📷',
  rarityOdds: {
    common: 70,
    uncommon: 20,
    rare: 7,
    epic: 2.5,
    legendary: 0.5,
  },
};

class PolaroidEngineService {
  private config: PolaroidPluginConfig = { ...DEFAULT_CONFIG };
  private queue: PolaroidRequest[] = [];
  private history: PolaroidRequest[] = [];
  private currentItem: PolaroidRequest | null = null;
  private isPaused: boolean = false;
  private isProcessing: boolean = false;

  // Statistics
  private stats = {
    totalSnaps: 0,
    snapsToday: 0,
    discordUploads: 0,
    rareDropsCount: 0,
    topViewersMap: {} as Record<string, number>,
  };

  constructor() {
    this.loadState();
    this.setupEventListeners();
  }

  private loadState(): void {
    if (typeof window !== 'undefined') {
      try {
        const savedCfg = localStorage.getItem('ghostos_polaroid_config');
        if (savedCfg) this.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedCfg) };

        const savedHist = localStorage.getItem('ghostos_polaroid_history');
        if (savedHist) this.history = JSON.parse(savedHist);

        const savedStats = localStorage.getItem('ghostos_polaroid_stats');
        if (savedStats) this.stats = JSON.parse(savedStats);
      } catch (e) {
        console.warn('Failed to load Polaroid Engine state', e);
      }
    }
  }

  public saveState(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ghostos_polaroid_config', JSON.stringify(this.config));
        localStorage.setItem('ghostos_polaroid_history', JSON.stringify(this.history.slice(0, 100)));
        localStorage.setItem('ghostos_polaroid_stats', JSON.stringify(this.stats));
      } catch (e) {
        console.warn('Failed to save Polaroid Engine state', e);
      }
    }
    EventBus.emit('PolaroidQueueUpdated', 'PolaroidEngine', {
      queue: this.queue,
      currentItem: this.currentItem,
      isPaused: this.isPaused,
      stats: this.stats,
    });
  }

  private setupEventListeners(): void {
    // 1. Listen for Chat Commands (!polaroid)
    EventBus.subscribe('ChatMessage', (evt) => {
      if (!this.config.enabled) return;
      const msg = evt.payload;
      if (!msg || !msg.message) return;

      const txt = msg.message.trim().toLowerCase();
      const twCmd = (this.config.twitchCommand || '!polaroid').toLowerCase();
      const kickCmd = (this.config.kickCommand || '!polaroid').toLowerCase();

      if (txt.startsWith(twCmd) || txt.startsWith(kickCmd) || txt.startsWith('!snap') || txt.startsWith('!photo')) {
        this.addRequest({
          username: msg.username,
          platform: msg.platform || 'twitch',
          triggerSource: 'chat_command',
        });
      }
    });

    // 2. Listen for Channel Points / Reward Claims
    EventBus.subscribe('RewardClaimed', (evt) => {
      if (!this.config.enabled || !this.config.triggerOnChannelPoints) return;
      const reward = evt.payload;
      if (reward?.rewardTitle?.toLowerCase().includes('polaroid') || reward?.title?.toLowerCase().includes('polaroid')) {
        this.addRequest({
          username: reward.username || reward.user || 'StreamViewer',
          platform: 'twitch',
          triggerSource: 'twitch_reward',
        });
      }
    });

    // 3. Listen for ChannelPointsRedeemed
    EventBus.subscribe('ChannelPointsRedeemed', (evt) => {
      if (!this.config.enabled) return;
      this.addRequest({
        username: evt.payload?.username || 'StreamViewer',
        platform: 'twitch',
        triggerSource: 'twitch_reward',
      });
    });
  }

  public getConfig(): PolaroidPluginConfig {
    return { ...this.config };
  }

  public updateConfig(newCfg: Partial<PolaroidPluginConfig>): void {
    this.config = { ...this.config, ...newCfg };
    this.saveState();
  }

  public getQueue(): PolaroidRequest[] {
    return [...this.queue];
  }

  public getCurrentItem(): PolaroidRequest | null {
    return this.currentItem;
  }

  public getHistory(): PolaroidRequest[] {
    return [...this.history];
  }

  public getStats() {
    return { ...this.stats };
  }

  public isQueuePaused(): boolean {
    return this.isPaused;
  }

  public pauseQueue(): void {
    this.isPaused = true;
    this.saveState();
  }

  public resumeQueue(): void {
    this.isPaused = false;
    this.saveState();
    this.processNextInQueue();
  }

  public clearQueue(): void {
    this.queue = [];
    this.saveState();
  }

  public cancelItem(id: string): void {
    this.queue = this.queue.filter((item) => item.id !== id);
    if (this.currentItem?.id === id) {
      this.currentItem = null;
      this.isProcessing = false;
      this.processNextInQueue();
    }
    this.saveState();
  }

  public skipCurrent(): void {
    if (this.currentItem) {
      this.currentItem.status = 'cancelled';
      this.currentItem = null;
      this.isProcessing = false;
      this.processNextInQueue();
      this.saveState();
    }
  }

  /**
   * Roll a random rare frame rarity based on configured probabilities
   */
  public rollRarity(): PolaroidRarity {
    if (!this.config.rareFramesEnabled) return 'common';

    const rand = Math.random() * 100;
    const { common, uncommon, rare, epic } = this.config.rarityOdds;

    if (rand < common) return 'common';
    if (rand < common + uncommon) return 'uncommon';
    if (rand < common + uncommon + rare) return 'rare';
    if (rand < common + uncommon + rare + epic) return 'epic';
    return 'legendary';
  }

  /**
   * Pick a theme based on configuration (random, weights, or default)
   */
  public pickTheme(requestedThemeId?: string): string {
    if (requestedThemeId && DEFAULT_POLAROID_THEMES.some((t) => t.id === requestedThemeId)) {
      return requestedThemeId;
    }

    if (!this.config.randomThemeMode) {
      return this.config.defaultThemeId || 'classic_white';
    }

    // Weighted theme picker
    const totalWeight = DEFAULT_POLAROID_THEMES.reduce((acc, t) => acc + (t.weight || 10), 0);
    let rand = Math.random() * totalWeight;

    for (const theme of DEFAULT_POLAROID_THEMES) {
      if (rand < theme.weight) return theme.id;
      rand -= theme.weight;
    }

    return DEFAULT_POLAROID_THEMES[0].id;
  }

  /**
   * Add a new Polaroid Request to the Queue
   */
  public addRequest(params: {
    username: string;
    platform?: Platform;
    triggerSource?: PolaroidRequest['triggerSource'];
    themeId?: string;
    forcedRarity?: PolaroidRarity;
    customCaption?: string;
  }): PolaroidRequest | null {
    if (this.queue.length >= this.config.maxQueueSize) {
      EventBus.emit('AlertTriggered', 'PolaroidEngine', {
        title: '⚠️ Polaroid Queue Full!',
        message: `Maximum queue limit (${this.config.maxQueueSize}) reached. Skipping snap.`,
        type: 'warning',
      });
      return null;
    }

    const now = new Date();
    const rarity = params.forcedRarity || this.rollRarity();
    const themeId = this.pickTheme(params.themeId);

    const req: PolaroidRequest = {
      id: `polaroid_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      username: params.username || 'StreamViewer',
      platform: params.platform || 'twitch',
      triggerSource: params.triggerSource || 'dashboard',
      themeId,
      rarity,
      timestamp: now.toISOString(),
      dateStr: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'queued',
      customCaption: params.customCaption,
    };

    this.queue.push(req);
    this.saveState();

    EventBus.emit('PolaroidStarted', 'PolaroidEngine', req);

    if (!this.isProcessing && !this.isPaused) {
      this.processNextInQueue();
    }

    return req;
  }

  /**
   * Generate an ultra-high fidelity simulated live stream canvas frame
   */
  public async captureStreamSnapshot(): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(this.getFallbackDataUrl());
        return;
      }

      // 1. Cinematic Stream Background Gradient / Gameplay simulation
      const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // 2. Draw Simulated Gameplay Visuals (Laser grid, game HUD, stream webcams)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 1280; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 720);
        ctx.stroke();
      }
      for (let j = 0; j < 720; j += 60) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(1280, j);
        ctx.stroke();
      }

      // Streamer Webcam Frame
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.fillRect(940, 400, 300, 280);
      ctx.strokeRect(940, 400, 300, 280);

      // Webcam Silhouette / Live Text
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🔴 LIVE OBS STREAMER CAM', 960, 430);

      // Stream Overlay Watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('👻 GHOSTOS STREAM HIGHLIGHT', 60, 90);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '20px monospace';
      ctx.fillText(`SNAP TIMESTAMP: ${new Date().toLocaleTimeString()} - 1080p60 OBS OUTPUT`, 60, 125);

      // Crosshair / Game reticle
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(640, 360, 24, 0, Math.PI * 2);
      ctx.stroke();

      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    });
  }

  private getFallbackDataUrl(): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  /**
   * Play camera shutter & audio effects using Web Audio API
   */
  public playShutterSound(): void {
    if (!this.config.soundEnabled || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const vol = Math.max(0.05, Math.min(1.0, this.config.soundVolume));

      // 1. Shutter Click (White noise burst)
      const bufferSize = ctx.sampleRate * 0.08;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);

      // 2. Motorized Film Eject Whine
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);

      oscGain.gain.setValueAtTime(vol * 0.3, now + 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now + 0.08);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio synthesis failed', e);
    }
  }

  /**
   * Main Queue Processor
   */
  private async processNextInQueue(): Promise<void> {
    if (this.isProcessing || this.isPaused || this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    this.currentItem = this.queue.shift()!;
    this.currentItem.status = 'capturing';
    this.saveState();

    // 1. Play Shutter Sound & Flash Event
    this.playShutterSound();

    // 2. Capture Snapshot at Flash Moment
    const snapshotUrl = await this.captureStreamSnapshot();
    this.currentItem.imageDataUrl = snapshotUrl;
    this.currentItem.status = 'developing';

    EventBus.emit('PolaroidCaptured', 'PolaroidEngine', this.currentItem);
    this.saveState();

    // 3. Emit Developing Event for Overlay
    EventBus.emit('PolaroidDeveloping', 'PolaroidEngine', {
      item: this.currentItem,
      developDurationMs: this.config.developDurationMs,
    });

    // 4. Simulate Developing Process Time
    setTimeout(() => {
      this.finishCurrentItem();
    }, this.config.developDurationMs + this.config.displayDurationMs);
  }

  /**
   * Complete current item, save to history, trigger Discord webhook & Chat alert
   */
  private finishCurrentItem(): void {
    if (!this.currentItem) return;

    this.currentItem.status = 'completed';

    // Update Stats
    this.stats.totalSnaps += 1;
    this.stats.snapsToday += 1;
    if (this.currentItem.rarity !== 'common') {
      this.stats.rareDropsCount += 1;
    }
    const user = this.currentItem.username;
    this.stats.topViewersMap[user] = (this.stats.topViewersMap[user] || 0) + 1;

    // Save to History
    this.history.unshift({ ...this.currentItem });

    // Send Discord Webhook
    if (this.config.discordEnabled && this.config.discordWebhookUrl) {
      this.sendDiscordWebhook(this.currentItem);
    }

    // Chat Announcement
    if (this.config.chatAnnounce) {
      const theme = DEFAULT_POLAROID_THEMES.find((t) => t.id === this.currentItem?.themeId)?.name || 'Classic';
      const rarity = (this.currentItem.rarity || 'common').toUpperCase();
      const msgText = this.config.chatAnnounceTemplate
        .replace('{username}', this.currentItem.username)
        .replace('{rarity}', rarity)
        .replace('{theme}', theme);

      EventBus.emit('ChatMessage', 'PolaroidEngine', {
        id: Date.now().toString(),
        platform: 'system',
        username: '📸 GhostOS Polaroid Engine',
        message: msgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    EventBus.emit('PolaroidCompleted', 'PolaroidEngine', this.currentItem);

    this.currentItem = null;
    this.isProcessing = false;
    this.saveState();

    // Process next item in queue
    setTimeout(() => {
      this.processNextInQueue();
    }, 500);
  }

  /**
   * Send Discord Webhook Notification with Polaroid Metadata
   */
  private async sendDiscordWebhook(item: PolaroidRequest): Promise<void> {
    try {
      this.stats.discordUploads += 1;
      this.saveState();

      EventBus.emit('PolaroidUploaded', 'PolaroidEngine', {
        item,
        webhookUrl: this.config.discordWebhookUrl,
      });
    } catch (e) {
      console.warn('Discord Webhook post failed', e);
    }
  }
}

export const PolaroidEngine = new PolaroidEngineService();
