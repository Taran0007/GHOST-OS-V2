/**
 * GhostOS Master Specification Types
 */

// Event Bus Types
export type EventType =
  | 'PluginLoaded'
  | 'PluginStopped'
  | 'PluginCrashed'
  | 'ViewerJoined'
  | 'ViewerLeft'
  | 'ChatMessage'
  | 'ChannelPointsRedeemed'
  | 'SceneChanged'
  | 'SceneSwitched'
  | 'StreamStarted'
  | 'StreamEnded'
  | 'PredictionStarted'
  | 'PredictionEnded'
  | 'WheelFinished'
  | 'AudioPlayed'
  | 'MemeVideoTriggered'
  | 'RewardClaimed'
  | 'BackupCreated'
  | 'BackupRestored'
  | 'AIResponseGenerated'
  | 'AlertTriggered'
  | 'FlowExecuted'
  | 'FlowRoutinesUpdated'
  | 'ThemeChanged'
  | 'AccountLinked'
  | 'AccountUnlinked'
  | 'AudioSettingsUpdated'
  | 'HotkeyUpdated'
  | 'DesktopConfigUpdated'
  | 'LocalAISettingsUpdated'
  | 'CreatorProfileUpdated'
  | 'TwitchRewardsUpdated'
  | 'DiscordConfigUpdated'
  | 'OBSConfigUpdated'
  | 'PolaroidStarted'
  | 'PolaroidCaptured'
  | 'PolaroidDeveloping'
  | 'PolaroidCompleted'
  | 'PolaroidUploaded'
  | 'PolaroidSaved'
  | 'PolaroidQueueUpdated';

export interface GhostEvent<T = any> {
  id: string;
  type: EventType;
  timestamp: string;
  source: string;
  payload: T;
}

// Chat Types
export type Platform = 'twitch' | 'kick' | 'youtube' | 'discord' | 'system';

export interface ChatMessage {
  id: string;
  platform: Platform;
  username: string;
  userColor?: string;
  avatar?: string;
  badges?: string[];
  message: string;
  timestamp: string;
  isSubscriber?: boolean;
  isVIP?: boolean;
  isMod?: boolean;
  isPinned?: boolean;
  sentiment?: 'positive' | 'neutral' | 'hype' | 'toxic';
}

// OBS Studio Integration Types
export interface OBSScene {
  id: string;
  name: string;
  sources: OBSSource[];
  active: boolean;
}

export interface OBSSource {
  id: string;
  name: string;
  type: 'browser' | 'display_capture' | 'game_capture' | 'audio' | 'video' | 'text' | 'image';
  visible: boolean;
  muted?: boolean;
  volume?: number;
  url?: string;
}

export interface OBSStatus {
  connected: boolean;
  streaming: boolean;
  recording: boolean;
  replayBuffer: boolean;
  fps: number;
  cpuUsage: number;
  memoryUsage: number;
  currentScene: string;
  uptimeSeconds: number;
  bitrateKbps: number;
}

// Stream Deck Button
export interface StreamDeckButton {
  id: string;
  label: string;
  icon: string;
  color: string;
  actionType: 'obs_scene' | 'play_sound' | 'spin_wheel' | 'ai_roast' | 'toggle_source' | 'custom_flow';
  payload?: any;
  hotkey?: string;
}

// Audio Deck / Soundboard
export interface SoundItem {
  id: string;
  name: string;
  category: string;
  icon?: string;
  duration: number; // in seconds
  volume: number;
  hotkey?: string;
  url?: string; // audio data url or path
}

// Meme / Video Overlay Item
export interface MemeItem {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  durationSeconds: number;
  hotkey?: string;
}

// Wheel Spin Item
export interface WheelEntry {
  id: string;
  label: string;
  color: string;
  weight: number;
}

export interface WheelConfig {
  id: string;
  title: string;
  entries: WheelEntry[];
  winnerHistory: { winner: string; timestamp: string }[];
}

// AI Companion & Personalities
export type AIPersonalityId =
  | 'funny'
  | 'toxic_safe'
  | 'serious'
  | 'mafia_boss'
  | 'sports_caster'
  | 'troll'
  | 'news_anchor'
  | 'motivational';

export interface AIPersonality {
  id: AIPersonalityId;
  name: string;
  description: string;
  tone: string;
  humorLevel: number;
  creativity: number;
  emojiUsage: boolean;
  systemPrompt: string;
}

export interface AIActionItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'scene_switch' | 'post_chat' | 'play_sound' | 'spin_wheel' | 'trigger_alert' | 'poll_start';
  payload: any;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  confidenceScore: number; // 0-100
  reasoning: string;
}

// Viewer & GTA RP Economy
export interface ViewerBusiness {
  id: string;
  name: string;
  type: 'nightclub' | 'mechanic' | 'taxi' | 'casino' | 'tech_co' | 'dealership';
  level: number;
  dailyIncome: number;
  upgradeCost: number;
}

export interface ViewerProfile {
  id: string;
  username: string;
  platform: Platform;
  avatar: string;
  watchTimeHours: number;
  totalMessages: number;
  points: number;
  xp: number;
  level: number;
  job: string;
  businesses: ViewerBusiness[];
  inventory: string[];
  achievements: string[];
  lastSeen: string;
  notes?: string;
}

// Flow Automation Node Builder
export interface FlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  title: string;
  category: 'obs' | 'chat' | 'ai' | 'economy' | 'sound' | 'wheel';
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface FlowConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface FlowRoutine {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  nodes: FlowNode[];
  connections: FlowConnection[];
}

// Plugin System Specs
export type PluginStatus = 'running' | 'paused' | 'stopped' | 'crashed' | 'unloaded';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'official' | 'community' | 'premium';
  icon: string;
  permissions: string[];
  status: PluginStatus;
  memoryUsageMb?: number;
  cpuUsagePct?: number;
}

// Theme Config
export type ThemeId = 'dark_glass' | 'neon_cyberpunk' | 'gta_sunset' | 'slate_minimal' | 'light_pro';

export interface GhostOSTheme {
  id: ThemeId;
  name: string;
  bgClass: string;
  cardClass: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  borderClass: string;
  glowClass?: string;
}

// Local LLM / AI Settings
export type AIProvider = 'gemini' | 'ollama' | 'lmstudio';

export interface LocalAISettings {
  provider: AIProvider;
  ollamaHost: string;
  ollamaModel: string;
  lmStudioHost: string;
  lmStudioModel: string;
  autoFallbackToGemini: boolean;
}

// Linked Platform Accounts
export interface LinkedAccounts {
  twitch: {
    connected: boolean;
    username: string;
    clientId?: string;
    accessToken?: string;
    botEnabled: boolean;
    autoChannelPointsSync: boolean;
  };
  kick: {
    connected: boolean;
    username: string;
    apiKey?: string;
    botEnabled: boolean;
  };
  youtube: {
    connected: boolean;
    channelName: string;
    streamKey?: string;
    liveChatId?: string;
  };
  discord: {
    connected: boolean;
    webhookUrl: string;
    botToken?: string;
    broadcastStreamStatus: boolean;
  };
  obs: {
    connected: boolean;
    host: string;
    port: number;
    password?: string;
    autoReconnect: boolean;
  };
}

// Audio Settings
export interface AudioSettings {
  micDevice: string;
  desktopDevice: string;
  masterVolume: number; // 0-100
  soundboardVolume: number; // 0-100
  routeToStream: boolean;
  routeToMonitor: boolean;
  duckingEnabled: boolean;
  duckingThresholdDb: number;
  noiseGateEnabled: boolean;
  noiseGateThresholdDb: number;
}

// Hotkey Configurations
export interface HotkeyConfig {
  sceneGaming: string;
  sceneChatting: string;
  sceneBRB: string;
  sceneEnding: string;
  muteMic: string;
  spinWheel: string;
  triggerAIRoast: string;
  emergencyStop: string;
}

// Hybrid Desktop / System Tray Config
export interface DesktopConfig {
  hybridModeEnabled: boolean;
  startWithOS: boolean;
  minimizeToTray: boolean;
  showTrayNotifications: boolean;
  globalHotkeysActive: boolean;
  hardwareAcceleration: boolean;
  webSocketPort: number;
}

// Creator Branding & Social Media Profile
export interface CreatorProfile {
  authorName: string;
  tagline: string;
  youtubeUrl: string;
  twitchUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  discordUrl: string;
  portfolioUrl: string;
}

// Twitch Channel Points Redemption Reward
export interface TwitchReward {
  id: string;
  title: string;
  cost: number;
  prompt: string;
  actionType: 'audio' | 'meme_overlay' | 'ai_roast' | 'scene_switch' | 'wheel_spin';
  actionPayload?: string; // e.g. Sound title, meme URL, or scene name
  enabled: boolean;
  backgroundColor: string;
}

// Discord Webhook & Server Integration Config
export interface DiscordWebhookConfig {
  webhookUrl: string;
  botName: string;
  avatarUrl: string;
  notifyOnGoLive: boolean;
  notifyOnClips: boolean;
  notifyOnRoasts: boolean;
  liveMessageTemplate: string;
}

