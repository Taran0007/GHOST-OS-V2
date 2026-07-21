import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  Zap,
  Play,
  Pause,
  Trash2,
  SkipForward,
  Settings,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Disc,
  Award,
  RefreshCw,
  BarChart2,
  Layers,
  Info,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { EventBus } from '../core/EventBus';
import {
  PolaroidEngine,
  PolaroidPluginConfig,
  PolaroidRequest,
  PolaroidTheme,
  DEFAULT_POLAROID_THEMES,
  PolaroidRarity,
} from '../core/PolaroidEngine';
import { PlatformLogo } from '../components/PlatformLogo';
import { Platform } from '../types';

export const PolaroidPluginView: React.FC = () => {
  const [config, setConfig] = useState<PolaroidPluginConfig>(PolaroidEngine.getConfig());
  const [queue, setQueue] = useState<PolaroidRequest[]>(PolaroidEngine.getQueue());
  const [currentItem, setCurrentItem] = useState<PolaroidRequest | null>(
    PolaroidEngine.getCurrentItem()
  );
  const [history, setHistory] = useState<PolaroidRequest[]>(PolaroidEngine.getHistory());
  const [stats, setStats] = useState(PolaroidEngine.getStats());
  const [isPaused, setIsPaused] = useState(PolaroidEngine.isQueuePaused());

  // Form State for Manual Trigger
  const [manualUser, setManualUser] = useState('StreamFan_99');
  const [manualPlatform, setManualPlatform] = useState<Platform>('twitch');
  const [manualTheme, setManualTheme] = useState('classic_white');
  const [manualRarity, setManualRarity] = useState<PolaroidRarity>('common');
  const [manualCaption, setManualCaption] = useState('Epic stream moment! 📸');

  // UI state
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'themes' | 'settings' | 'history' | 'obs'>('control');
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    // Synchronize queue and engine events
    const unsub = EventBus.subscribe('PolaroidQueueUpdated', (evt) => {
      if (evt.payload) {
        setQueue(evt.payload.queue || []);
        setCurrentItem(evt.payload.currentItem || null);
        setIsPaused(!!evt.payload.isPaused);
        if (evt.payload.stats) setStats(evt.payload.stats);
      }
      setHistory(PolaroidEngine.getHistory());
    });

    const unsubComp = EventBus.subscribe('PolaroidCompleted', () => {
      setHistory(PolaroidEngine.getHistory());
      setStats(PolaroidEngine.getStats());
    });

    return () => {
      unsub();
      unsubComp();
    };
  }, []);

  const handleUpdateConfig = (updates: Partial<PolaroidPluginConfig>) => {
    PolaroidEngine.updateConfig(updates);
    setConfig(PolaroidEngine.getConfig());
    setTestResult('Configuration saved successfully!');
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleManualTrigger = () => {
    PolaroidEngine.addRequest({
      username: manualUser,
      platform: manualPlatform,
      triggerSource: 'dashboard',
      themeId: manualTheme,
      forcedRarity: manualRarity,
      customCaption: manualCaption,
    });
    setTestResult(`📸 Triggered snap for @${manualUser}!`);
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleCopyObsUrl = () => {
    const url = `${window.location.origin}/#overlay-polaroid`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const selectedThemeObj: PolaroidTheme =
    DEFAULT_POLAROID_THEMES.find((t) => t.id === manualTheme) || DEFAULT_POLAROID_THEMES[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-100 pb-20">
      {/* Plugin Header Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Camera className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-slate-100 font-mono">
                GHOSTOS POLAROID PLUGIN
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                v2.4 FLAGSHIP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live OBS Stream Frame Captures, Realistic Developing Animations & Discord Archiving
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleManualTrigger}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" /> SNAP POLAROID NOW
          </button>

          {isPaused ? (
            <button
              onClick={() => PolaroidEngine.resumeQueue()}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Play className="w-4 h-4" /> RESUME QUEUE
            </button>
          ) : (
            <button
              onClick={() => PolaroidEngine.pauseQueue()}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Pause className="w-4 h-4" /> PAUSE QUEUE
            </button>
          )}

          <button
            onClick={() => PolaroidEngine.clearQueue()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-300 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Clear Queue"
          >
            <Trash2 className="w-4 h-4" /> CLEAR
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" /> {testResult}
        </div>
      )}

      {/* Ribbon Bar / Status Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase">PLUGIN STATUS</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
              config.enabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {config.enabled ? 'ACTIVE & ONLINE' : 'DISABLED'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase">OBS WEBSOCKET</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> CONNECTED
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase">DISCORD WEBHOOK</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold ${
              config.discordEnabled
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {config.discordEnabled ? 'READY' : 'OFF'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase">TOTAL SNAPS</span>
          <span className="text-sm font-extrabold font-mono text-cyan-300">
            {stats.totalSnaps}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'control', label: 'Control Center & Queue', icon: Camera },
          { id: 'themes', label: 'Themes & Rarity Matrix', icon: Layers },
          { id: 'settings', label: 'Commands & Discord Config', icon: Settings },
          { id: 'history', label: 'Snap History & Stats', icon: BarChart2 },
          { id: 'obs', label: 'OBS Browser Source', icon: ExternalLink },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONTROL CENTER & QUEUE */}
      {activeTab === 'control' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): Active Camera Preview & Live Queue */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Camera Developing Preview Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                    CURRENT SNAP PROCESSOR
                  </h2>
                </div>
                {currentItem && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    STATUS: {currentItem.status.toUpperCase()}
                  </span>
                )}
              </div>

              {currentItem ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-48 h-56 rounded-xl bg-slate-900 p-3 flex flex-col items-center justify-between border border-slate-700 shadow-2xl relative">
                    <div className="w-full h-36 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      {currentItem.imageDataUrl && (
                        <img
                          src={currentItem.imageDataUrl}
                          alt="Current Snap"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black text-slate-200">
                        @{currentItem.username}
                      </div>
                      <div className="text-[9px] font-mono text-cyan-400">
                        {currentItem.dateStr} - {currentItem.rarity.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">REQUEST ID:</span>
                      <span className="font-mono text-slate-200 font-bold">{currentItem.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">TRIGGER SOURCE:</span>
                      <span className="font-mono text-cyan-300 font-bold uppercase">
                        {currentItem.triggerSource} ({currentItem.platform})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">SELECTED THEME:</span>
                      <span className="font-mono text-purple-300 font-bold uppercase">
                        {currentItem.themeId}
                      </span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => PolaroidEngine.skipCurrent()}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-mono text-xs font-bold flex items-center gap-1"
                      >
                        <SkipForward className="w-3.5 h-3.5" /> SKIP CURRENT
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                  <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-xs font-mono text-slate-400">
                    No active Polaroid snapshot in progress
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Redeem on Twitch/Kick or click "SNAP POLAROID NOW" to test
                  </div>
                </div>
              )}
            </div>

            {/* FIFO Queue Table */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                    POLAROID FIFO QUEUE ({queue.length} QUEUED)
                  </h2>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  MAX QUEUE: {config.maxQueueSize}
                </div>
              </div>

              {queue.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {queue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <PlatformLogo platform={item.platform} size="sm" />
                        <div>
                          <div className="font-bold text-slate-200">@{item.username}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {item.themeId} • {item.rarity.toUpperCase()} • {item.timeStr}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                          {item.triggerSource}
                        </span>
                        <button
                          onClick={() => PolaroidEngine.cancelItem(item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-400 transition-all"
                          title="Cancel Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs font-mono text-slate-500">
                  Queue is empty. Incoming viewer redeems will appear here automatically.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Manual Trigger Studio */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                  MANUAL POLAROID TRIGGER
                </h2>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    VIEWER USERNAME
                  </label>
                  <input
                    type="text"
                    value={manualUser}
                    onChange={(e) => setManualUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      PLATFORM
                    </label>
                    <select
                      value={manualPlatform}
                      onChange={(e) => setManualPlatform(e.target.value as Platform)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="twitch">Twitch</option>
                      <option value="kick">Kick</option>
                      <option value="youtube">YouTube</option>
                      <option value="system">Streamer / Mod</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      FORCED RARITY
                    </label>
                    <select
                      value={manualRarity}
                      onChange={(e) => setManualRarity(e.target.value as PolaroidRarity)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="common">Common (White)</option>
                      <option value="uncommon">Uncommon (Green)</option>
                      <option value="rare">Rare (Cyan Glow)</option>
                      <option value="epic">Epic (Purple Glow)</option>
                      <option value="legendary">Legendary (Gold)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    POLAROID THEME
                  </label>
                  <select
                    value={manualTheme}
                    onChange={(e) => setManualTheme(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  >
                    {DEFAULT_POLAROID_THEMES.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    HANDWRITTEN CAPTION
                  </label>
                  <input
                    type="text"
                    value={manualCaption}
                    onChange={(e) => setManualCaption(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleManualTrigger}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs font-mono shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4" /> TRIGGER INSTANT POLAROID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEMES & RARITY MATRIX */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                  PREMIUM POLAROID THEMES
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select default themes or enable Random Theme mode with customizable weights.
                </p>
              </div>
              <button
                onClick={() => handleUpdateConfig({ randomThemeMode: !config.randomThemeMode })}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  config.randomThemeMode
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                RANDOM THEMES: {config.randomThemeMode ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEFAULT_POLAROID_THEMES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleUpdateConfig({ defaultThemeId: t.id })}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    config.defaultThemeId === t.id
                      ? 'bg-slate-950 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">{t.name}</span>
                    {config.defaultThemeId === t.id && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{t.description}</p>

                  <div className="w-full h-24 rounded-xl p-2 flex items-center justify-center border border-slate-800" style={{ background: t.frameBg }}>
                    <div className="w-24 h-16 bg-slate-950 rounded border border-slate-800 flex items-center justify-center text-[10px] font-mono font-bold" style={{ color: t.textColor }}>
                      {t.badge || 'SAMPLE'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMANDS & DISCORD CONFIG */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-800/80 pb-3">
              CHAT COMMANDS & CHANNEL POINTS
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  TWITCH CHAT COMMAND
                </label>
                <input
                  type="text"
                  value={config.twitchCommand}
                  onChange={(e) => setConfig({ ...config, twitchCommand: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  KICK CHAT COMMAND
                </label>
                <input
                  type="text"
                  value={config.kickCommand}
                  onChange={(e) => setConfig({ ...config, kickCommand: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleUpdateConfig(config)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all"
                >
                  SAVE COMMAND SETTINGS
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-800/80 pb-3">
              DISCORD WEBHOOK INTEGRATION
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  DISCORD WEBHOOK URL
                </label>
                <input
                  type="text"
                  value={config.discordWebhookUrl}
                  onChange={(e) => setConfig({ ...config, discordWebhookUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  MESSAGE TEMPLATE
                </label>
                <textarea
                  rows={3}
                  value={config.discordMessageTemplate}
                  onChange={(e) => setConfig({ ...config, discordMessageTemplate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={() => handleUpdateConfig(config)}
                className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold transition-all"
              >
                SAVE DISCORD SETTINGS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORY ARCHIVE */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
              POLAROID ARCHIVE ({history.length} SNAPS SAVED)
            </h2>
          </div>

          {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {history.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="w-full h-44 rounded-lg bg-slate-900 overflow-hidden border border-slate-800 relative">
                    {snap.imageDataUrl && (
                      <img
                        src={snap.imageDataUrl}
                        alt="Saved Snap"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">@{snap.username}</span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {snap.timeStr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No Polaroid snaps in archive yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: OBS BROWSER SOURCE */}
      {activeTab === 'obs' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider border-b border-slate-800/80 pb-3">
            OBS STUDIO BROWSER SOURCE CONFIGURATION
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs font-mono">
            <p className="text-slate-300">
              Add a new <span className="text-cyan-400 font-bold">Browser Source</span> in OBS Studio with the following settings:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/#overlay-polaroid`}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono text-xs"
              />
              <button
                onClick={handleCopyObsUrl}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedUrl ? 'COPIED!' : 'COPY URL'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                WIDTH: <span className="text-slate-200 font-bold">1920</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                HEIGHT: <span className="text-slate-200 font-bold">1080</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                FPS: <span className="text-slate-200 font-bold">60 FPS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                BG: <span className="text-slate-200 font-bold">Transparent</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
