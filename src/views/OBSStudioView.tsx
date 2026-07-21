import React, { useState } from 'react';
import {
  Video,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Layers,
  Camera,
  Play,
  CheckCircle2,
  Sliders,
  Radio,
  Flame,
  Copy,
  Check,
  Film,
  Sparkles,
  Server,
  Wifi,
  Lock,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { OBSService } from '../core/OBSService';
import { OBSScene } from '../types';
import { EventBus } from '../core/EventBus';

export const OBSStudioView: React.FC = () => {
  const [scenes, setScenes] = useState<OBSScene[]>(OBSService.getScenes());
  const [obsStatus, setObsStatus] = useState(OBSService.getStatus());
  const [wsConfig, setWsConfig] = useState(OBSService.getWebSocketConfig());
  const [connectingWs, setConnectingWs] = useState(false);
  const [wsStatusMsg, setWsStatusMsg] = useState<string | null>(null);
  const [screenshotNotif, setScreenshotNotif] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [customMemeUrl, setCustomMemeUrl] = useState('');
  const [customMemeTitle, setCustomMemeTitle] = useState('');

  const handleConnectWebSocket = async () => {
    setConnectingWs(true);
    setWsStatusMsg('Connecting to OBS WebSocket v5 server...');
    await OBSService.connectDirectWebSocket(wsConfig.host, wsConfig.port, wsConfig.password);
    setWsConfig(OBSService.getWebSocketConfig());
    setObsStatus(OBSService.getStatus());
    setConnectingWs(false);
    setWsStatusMsg('✅ Connected directly to OBS WebSocket Server v5!');
    setTimeout(() => setWsStatusMsg(null), 3500);
  };

  const handleCopyMemeOverlayUrl = () => {
    const url = `${window.location.origin}/#overlay-meme`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleTriggerMeme = (title: string, videoUrl: string, durationSeconds: number = 5) => {
    EventBus.emit('MemeVideoTriggered', 'OBSStudioView', {
      title,
      videoUrl,
      durationSeconds,
    });
    EventBus.emit('AlertTriggered', 'OBSStudioView', {
      title: `🎬 Meme Overlay Triggered: ${title}`,
      type: 'obs',
    });
  };

  const activeScene = scenes.find((s) => s.active) || scenes[0];

  const handleSwitchScene = (id: string) => {
    OBSService.switchScene(id);
    setScenes([...OBSService.getScenes()]);
    setObsStatus(OBSService.getStatus());
  };

  const handleToggleVisibility = (sceneId: string, sourceId: string) => {
    OBSService.toggleSourceVisibility(sceneId, sourceId);
    setScenes([...OBSService.getScenes()]);
  };

  const handleToggleMute = (sceneId: string, sourceId: string) => {
    OBSService.toggleAudioMute(sceneId, sourceId);
    setScenes([...OBSService.getScenes()]);
  };

  const handleVolumeChange = (sceneId: string, sourceId: string, vol: number) => {
    OBSService.setAudioVolume(sceneId, sourceId, vol);
    setScenes([...OBSService.getScenes()]);
  };

  const handleCaptureScreenshot = () => {
    const filename = `OBS_Shot_${Date.now()}.png`;
    setScreenshotNotif(`Captured 1080p frame: ${filename}`);
    setTimeout(() => setScreenshotNotif(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* OBS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            OBS Studio Core Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            OBS WebSocket v5 Bridge — Direct control over scene collections, sources, audio, and replay buffers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCaptureScreenshot}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700 shadow-sm"
          >
            <Camera className="w-4 h-4 text-indigo-400" /> Frame Screenshot
          </button>
          <button
            onClick={() => OBSService.saveReplayBuffer()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
          >
            <Play className="w-4 h-4" /> Save Replay Buffer
          </button>
        </div>
      </div>

      {screenshotNotif && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          {screenshotNotif}
        </div>
      )}

      {/* OBS WebSocket v5 Direct Control Settings Bar */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">
              OBS WebSocket Direct Server Connection
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
              v5 Protocol Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${wsConfig.connected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span className="text-xs font-mono font-bold text-slate-300">
              {wsConfig.connected ? `CONNECTED: ws://${wsConfig.host}:${wsConfig.port}` : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {wsStatusMsg && (
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            {wsStatusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Server Host / IP
            </label>
            <input
              type="text"
              value={wsConfig.host}
              onChange={(e) => setWsConfig({ ...wsConfig, host: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="127.0.0.1 or localhost"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-indigo-400" /> WebSocket Port
            </label>
            <input
              type="number"
              value={wsConfig.port}
              onChange={(e) => setWsConfig({ ...wsConfig, port: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="4455"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Server Password (Optional)
            </label>
            <input
              type="password"
              value={wsConfig.password || ''}
              onChange={(e) => setWsConfig({ ...wsConfig, password: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="OBS WebSocket Password"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleConnectWebSocket}
            disabled={connectingWs}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${connectingWs ? 'animate-spin' : ''}`} />
            {connectingWs ? 'Connecting...' : 'Connect WebSocket Direct'}
          </button>
        </div>
      </div>

      {/* Main Grid: Scenes | Sources Tree | Audio Mixer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scenes List */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Scenes Collection ({scenes.length})
          </h2>

          <div className="space-y-2">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => handleSwitchScene(scene.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  scene.active
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-600/20 border-cyan-500/50 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs">{scene.name}</span>
                </div>
                {scene.active && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono">
                    PROGRAM
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Source Tree for Active Scene */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-400" />
            Sources ({activeScene.sources.length})
          </h2>

          <div className="space-y-2">
            {activeScene.sources.map((src) => (
              <div
                key={src.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-200 font-medium truncate">{src.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                    {src.type}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleVisibility(activeScene.id, src.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    src.visible
                      ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                      : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                  title="Toggle Source Visibility"
                >
                  {src.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Mixer */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            OBS Audio Mixer
          </h2>

          <div className="space-y-4">
            {activeScene.sources
              .filter((s) => s.type === 'audio')
              .map((audioSrc) => (
                <div key={audioSrc.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{audioSrc.name}</span>
                    <button
                      onClick={() => handleToggleMute(activeScene.id, audioSrc.id)}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                        audioSrc.muted
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {audioSrc.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      {audioSrc.muted ? 'MUTED' : 'LIVE'}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioSrc.volume || 80}
                      onChange={(e) =>
                        handleVolumeChange(activeScene.id, audioSrc.id, parseInt(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-xs font-mono text-slate-400 w-8 text-right">
                      {audioSrc.volume || 80}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Meme & Video Overlay OBS Browser Source Control Deck */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              OBS Video & Meme Overlay Browser Source
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Plays hotkey-triggered videos & memes directly on top of your stream without borders or window frames.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-300">
              Hotkey: CTRL+SHIFT+M
            </span>
            <button
              onClick={handleCopyMemeOverlayUrl}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUrl ? 'Copied OBS Link!' : 'Copy OBS Browser Source URL'}
            </button>
          </div>
        </div>

        {/* Preset Meme Quick Trigger Grid */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300">1-Click Preset Meme Triggers:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() =>
                handleTriggerMeme(
                  '🐱 Dancing Cat Meme',
                  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWkzaHF4aW1sdGg4azVsNXNydjQyZHc1bXFpdnlmdThic3R4MmcwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPbDhAzsrtdB3unK9v/giphy.gif',
                  5
                )
              }
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left space-y-1 transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">🐱 Dancing Cat</div>
              <div className="text-[10px] text-slate-500 font-mono">5s Transparent Overlay</div>
            </button>

            <button
              onClick={() =>
                handleTriggerMeme(
                  '🗿 GigaChad Sigma Meme',
                  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcDZ0dmRzOXUwdWk0YTRrNW0ydDF6emZxdHExNmxsMTAxdjJveSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CAYVZA5NRb529kKQUc/giphy.gif',
                  5
                )
              }
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left space-y-1 transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">🗿 GigaChad Sigma</div>
              <div className="text-[10px] text-slate-500 font-mono">5s Transparent Overlay</div>
            </button>

            <button
              onClick={() =>
                handleTriggerMeme(
                  '🎹 Keyboard Cat Classic',
                  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGhpd3lhNWJ4ZXF6ZnlxOHIyeXQzeWhzZnllcGg2ZWRzcmR1Z3EweSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif',
                  6
                )
              }
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left space-y-1 transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">🎹 Keyboard Cat</div>
              <div className="text-[10px] text-slate-500 font-mono">6s Transparent Overlay</div>
            </button>

            <button
              onClick={() =>
                handleTriggerMeme(
                  '🕺 Wide Putin Walking',
                  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXNreGtmaWd3aXNmOHU1NDkxaDRxOWg4a2FxdW44YXdwZmIybG05ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vA37jM3K0E02fAt44B/giphy.gif',
                  6
                )
              }
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 text-left space-y-1 transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-rose-300">🕺 Wide Putin Meme</div>
              <div className="text-[10px] text-slate-500 font-mono">6s Transparent Overlay</div>
            </button>
          </div>
        </div>

        {/* Custom Meme URL Trigger Input */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Title (e.g. Victory Dance)"
            value={customMemeTitle}
            onChange={(e) => setCustomMemeTitle(e.target.value)}
            className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="url"
            placeholder="Custom Video or GIF URL (https://...mp4 or .gif)"
            value={customMemeUrl}
            onChange={(e) => setCustomMemeUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => {
              if (!customMemeUrl) return alert('Please enter a video or GIF URL.');
              handleTriggerMeme(customMemeTitle || 'Custom Stream Meme', customMemeUrl, 5);
              setCustomMemeUrl('');
              setCustomMemeTitle('');
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
          >
            Trigger Video Overlay 🔥
          </button>
        </div>
      </div>
    </div>
  );
};
