import { EventBus } from './EventBus';
import { PluginManager } from './PluginManager';
import { OBSService } from './OBSService';
import { FlowEngine } from './FlowEngine';
import { EconomyEngine } from './EconomyEngine';
import { ThemeEngine } from './ThemeEngine';
import {
  LinkedAccounts,
  AudioSettings,
  HotkeyConfig,
  DesktopConfig,
  ThemeId,
  LocalAISettings,
  CreatorProfile,
  TwitchReward,
  DiscordWebhookConfig,
} from '../types';

export interface BackupData {
  version: string;
  timestamp: string;
  plugins: any[];
  obs: any;
  routines: any[];
  economy: any[];
  accounts: LinkedAccounts;
  audio: AudioSettings;
  hotkeys: HotkeyConfig;
  desktop: DesktopConfig;
  localAI?: LocalAISettings;
  creator?: CreatorProfile;
  twitchRewards?: TwitchReward[];
  discord?: DiscordWebhookConfig;
  settings: Record<string, any>;
}

class StorageServiceClass {
  private defaultAccounts: LinkedAccounts = {
    twitch: {
      connected: true,
      username: 'GhostStreamer',
      clientId: 'ghost_tw_client_992',
      accessToken: 'oauth:ghost_token_sample',
      botEnabled: true,
      autoChannelPointsSync: true,
    },
    kick: {
      connected: true,
      username: 'GhostKick',
      apiKey: 'kick_live_key_991',
      botEnabled: true,
    },
    youtube: {
      connected: false,
      channelName: 'GhostOS Official',
      streamKey: 'live_yt_key_1122',
    },
    discord: {
      connected: true,
      webhookUrl: 'https://discord.com/api/webhooks/123/ghost_alerts',
      broadcastStreamStatus: true,
    },
    obs: {
      connected: true,
      host: 'localhost',
      port: 4455,
      password: 'ghost_password',
      autoReconnect: true,
    },
  };

  private defaultAudio: AudioSettings = {
    micDevice: 'Default System Microphone',
    desktopDevice: 'Default High Definition Audio Output',
    masterVolume: 85,
    soundboardVolume: 80,
    routeToStream: true,
    routeToMonitor: true,
    duckingEnabled: true,
    duckingThresholdDb: -18,
    noiseGateEnabled: true,
    noiseGateThresholdDb: -42,
  };

  private defaultHotkeys: HotkeyConfig = {
    sceneGaming: 'Ctrl+Num1',
    sceneChatting: 'Ctrl+Num2',
    sceneBRB: 'Ctrl+Num3',
    sceneEnding: 'Ctrl+Num4',
    muteMic: 'Ctrl+M',
    spinWheel: 'Ctrl+Shift+W',
    triggerAIRoast: 'Ctrl+Shift+R',
    emergencyStop: 'Ctrl+Alt+E',
  };

  private defaultDesktop: DesktopConfig = {
    hybridModeEnabled: true,
    startWithOS: true,
    minimizeToTray: true,
    showTrayNotifications: true,
    globalHotkeysActive: true,
    hardwareAcceleration: true,
    webSocketPort: 3000,
  };

  private defaultLocalAI: LocalAISettings = {
    provider: 'gemini',
    ollamaHost: 'http://localhost:11434',
    ollamaModel: 'llama3',
    lmStudioHost: 'http://localhost:1234/v1',
    lmStudioModel: 'local-model',
    autoFallbackToGemini: true,
  };

  private defaultCreatorProfile: CreatorProfile = {
    authorName: 'TJ SINGH',
    tagline: 'Streamer, Software Developer & AI Specialist',
    youtubeUrl: 'https://youtube.com/@TJSINGH',
    twitchUrl: 'https://twitch.tv/TJSINGH',
    twitterUrl: 'https://x.com/TJSINGH',
    instagramUrl: 'https://instagram.com/TJSINGH',
    discordUrl: 'https://discord.gg/TJSINGH',
    portfolioUrl: 'https://tjsingh.com',
  };

  public getCreatorProfile(): CreatorProfile {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_creator_profile');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return this.defaultCreatorProfile;
  }

  public saveCreatorProfile(creator: CreatorProfile): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_creator_profile', JSON.stringify(creator));
    }
    EventBus.emit('CreatorProfileUpdated', 'StorageService', { creator });
  }

  private defaultTwitchRewards: TwitchReward[] = [
    {
      id: 'reward-1',
      title: '🐱 Trigger Dancing Cat Meme Overlay',
      cost: 500,
      prompt: 'Triggers a 5-second transparent Dancing Cat overlay on top of the live stream video!',
      actionType: 'meme_overlay',
      actionPayload: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWkzaHF4aW1sdGg4azVsNXNydjQyZHc1bXFpdnlmdThic3R4MmcwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPbDhAzsrtdB3unK9v/giphy.gif',
      enabled: true,
      backgroundColor: '#9146FF',
    },
    {
      id: 'reward-2',
      title: '🎺 Play Vine Boom / Air Horn Sound',
      cost: 300,
      prompt: 'Plays an explosive sound effect live to stream audio output.',
      actionType: 'audio',
      actionPayload: '🎺 Air Horn Blast',
      enabled: true,
      backgroundColor: '#00F3FF',
    },
    {
      id: 'reward-3',
      title: '🤖 GhostAI Co-Host Roast Streamer',
      cost: 1500,
      prompt: 'AI Co-Host writes & speaks a hilarious custom roast live in stream multi-chat!',
      actionType: 'ai_roast',
      actionPayload: 'Streamer TJ SINGH',
      enabled: true,
      backgroundColor: '#FF4655',
    },
    {
      id: 'reward-4',
      title: '🎡 Spin VIP Prize Wheel',
      cost: 2500,
      prompt: 'Spins the live prize wheel on stream overlay for chat rewards.',
      actionType: 'wheel_spin',
      actionPayload: 'VIP Prize Wheel',
      enabled: true,
      backgroundColor: '#10B981',
    },
    {
      id: 'reward-5',
      title: '🗿 GigaChad Sigma Meme Overlay',
      cost: 1000,
      prompt: 'Displays GigaChad Sigma overlay on stream.',
      actionType: 'meme_overlay',
      actionPayload: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcDZ0dmRzOXUwdWk0YTRrNW0ydDF6emZxdHExNmxsMTAxdjJveSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CAYVZA5NRb529kKQUc/giphy.gif',
      enabled: true,
      backgroundColor: '#F59E0B',
    },
  ];

  public getTwitchRewards(): TwitchReward[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_twitch_rewards');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return this.defaultTwitchRewards;
  }

  public saveTwitchRewards(rewards: TwitchReward[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_twitch_rewards', JSON.stringify(rewards));
    }
    EventBus.emit('TwitchRewardsUpdated', 'StorageService', { rewards });
  }

  private defaultDiscordConfig: DiscordWebhookConfig = {
    webhookUrl: 'https://discord.com/api/webhooks/1234567890/example_token',
    botName: 'GhostOS Stream Bot',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostOSBot',
    notifyOnGoLive: true,
    notifyOnClips: true,
    notifyOnRoasts: true,
    liveMessageTemplate: '🔴 @everyone TJ SINGH is now LIVE on Twitch & YouTube! Come join the stream co-hosted by GhostAI!',
  };

  public getDiscordConfig(): DiscordWebhookConfig {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_discord_config');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return this.defaultDiscordConfig;
  }

  public saveDiscordConfig(config: DiscordWebhookConfig): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_discord_config', JSON.stringify(config));
    }
    EventBus.emit('DiscordConfigUpdated', 'StorageService', { config });
  }

  public getAccounts(): LinkedAccounts {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_accounts');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return this.defaultAccounts;
  }

  public saveAccounts(accounts: LinkedAccounts): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_accounts', JSON.stringify(accounts));
    }
    EventBus.emit('AccountLinked', 'StorageService', { accounts });
  }

  public getAudioSettings(): AudioSettings {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_audio');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return this.defaultAudio;
  }

  public saveAudioSettings(audio: AudioSettings): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_audio', JSON.stringify(audio));
    }
    EventBus.emit('AudioSettingsUpdated', 'StorageService', { audio });
  }

  public getHotkeys(): HotkeyConfig {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_hotkeys');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return this.defaultHotkeys;
  }

  public saveHotkeys(hotkeys: HotkeyConfig): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_hotkeys', JSON.stringify(hotkeys));
    }
    EventBus.emit('HotkeyUpdated', 'StorageService', { hotkeys });
  }

  public getDesktopConfig(): DesktopConfig {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_desktop');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return this.defaultDesktop;
  }

  public saveDesktopConfig(desktop: DesktopConfig): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_desktop', JSON.stringify(desktop));
    }
    EventBus.emit('DesktopConfigUpdated', 'StorageService', { desktop });
  }

  public getLocalAISettings(): LocalAISettings {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_local_ai');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return this.defaultLocalAI;
  }

  public saveLocalAISettings(localAI: LocalAISettings): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_local_ai', JSON.stringify(localAI));
    }
    EventBus.emit('LocalAISettingsUpdated', 'StorageService', { localAI });
  }

  public createBackup(): BackupData {
    const backup: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      plugins: PluginManager.getAllPlugins(),
      obs: {
        status: OBSService.getStatus(),
        scenes: OBSService.getScenes(),
      },
      routines: FlowEngine.getRoutines(),
      economy: EconomyEngine.getViewers(),
      accounts: this.getAccounts(),
      audio: this.getAudioSettings(),
      hotkeys: this.getHotkeys(),
      desktop: this.getDesktopConfig(),
      localAI: this.getLocalAISettings(),
      creator: this.getCreatorProfile(),
      settings: {
        theme: ThemeEngine.getActiveTheme().id,
        obsPort: 4455,
        aiDefaultModel: 'gemini-3.6-flash',
        overlayLatencyMs: 15,
      },
    };

    EventBus.emit('BackupCreated', 'StorageService', {
      timestamp: backup.timestamp,
      sizeKb: Math.round(JSON.stringify(backup).length / 1024),
    });

    return backup;
  }

  public downloadBackupJSON(): void {
    const data = this.createBackup();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GhostOS_FullBackup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public restoreFromJSON(jsonString: string): boolean {
    try {
      const data: BackupData = JSON.parse(jsonString);
      if (data.version || data.timestamp) {
        if (data.accounts) this.saveAccounts(data.accounts);
        if (data.audio) this.saveAudioSettings(data.audio);
        if (data.hotkeys) this.saveHotkeys(data.hotkeys);
        if (data.desktop) this.saveDesktopConfig(data.desktop);
        if (data.localAI) this.saveLocalAISettings(data.localAI);
        if (data.settings?.theme) {
          ThemeEngine.setTheme(data.settings.theme as ThemeId);
        }

        EventBus.emit('BackupRestored', 'StorageService', {
          timestamp: data.timestamp || new Date().toISOString(),
          restoredItems: Object.keys(data).length,
        });
        return true;
      }
    } catch (err) {
      console.error('Invalid backup file', err);
    }
    return false;
  }
}

export const StorageService = new StorageServiceClass();
