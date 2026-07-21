import React, { useState, useEffect } from 'react';
import {
  Radio,
  Video,
  Bot,
  Activity,
  Flame,
  Volume2,
  Disc,
  Play,
  Check,
  X,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  BarChart3,
  Users,
} from 'lucide-react';
import { OBSService } from '../core/OBSService';
import { AIEngine } from '../core/AIEngine';
import { PluginManager } from '../core/PluginManager';
import { AIActionItem, OBSScene } from '../types';
import { PlatformLogo } from '../components/PlatformLogo';

export const OverviewDashboard: React.FC = () => {
  const [obsStatus, setObsStatus] = useState(OBSService.getStatus());
  const [scenes, setScenes] = useState<OBSScene[]>(OBSService.getScenes());
  const [actions, setActions] = useState<AIActionItem[]>(AIEngine.getActionQueue());
  const [plugins] = useState(PluginManager.getAllPlugins());

  useEffect(() => {
    const interval = setInterval(() => {
      setObsStatus(OBSService.getStatus());
      setScenes(OBSService.getScenes());
      setActions(AIEngine.getActionQueue());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSceneSwitch = (sceneId: string) => {
    OBSService.switchScene(sceneId);
    setScenes(OBSService.getScenes());
    setObsStatus(OBSService.getStatus());
  };

  const handleApproveAction = (id: string) => {
    AIEngine.approveAction(id);
    setActions(AIEngine.getActionQueue());
  };

  const handleRejectAction = (id: string) => {
    AIEngine.rejectAction(id);
    setActions(AIEngine.getActionQueue());
  };

  const currentScene = scenes.find((s) => s.active);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            GhostOS Creator Dashboard
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              ALL SYSTEMS ONLINE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modular streaming operating system active. Connected to OBS Studio v30 & Gemini AI Engine.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">FPS</span>
            <span className="text-emerald-400 font-bold">{obsStatus.fps} FPS</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">BITRATE</span>
            <span className="text-cyan-400 font-bold">{obsStatus.bitrateKbps} Kbps</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">CPU USAGE</span>
            <span className="text-indigo-400 font-bold">{obsStatus.cpuUsage}%</span>
          </div>
        </div>
      </div>

      {/* Live Stream Viewers Analytics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <PlatformLogo platform="twitch" size="sm" showLabel />
            <div className="text-base font-extrabold text-slate-100 font-mono">1,820</div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">1080p60</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <PlatformLogo platform="kick" size="sm" showLabel />
            <div className="text-base font-extrabold text-slate-100 font-mono">1,240</div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">1080p60</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <PlatformLogo platform="youtube" size="sm" showLabel />
            <div className="text-base font-extrabold text-slate-100 font-mono">1,400</div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">1440p60</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" /> TOTAL VIEWERS
            </span>
            <div className="text-base font-extrabold text-cyan-300 font-mono">4,460</div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold animate-pulse">
            LIVE
          </span>
        </div>
      </div>

      {/* Grid Layout: Stream Canvas Preview + Scenes Switcher + AI Director */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Stream Preview Canvas & Quick Scene Switcher */}
        <div className="lg:col-span-2 space-y-6">
          {/* OBS Canvas Viewfinder */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">
                  OBS Live Viewfinder: <span className="text-cyan-400">{currentScene?.name}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                1080p60 Canvas
              </div>
            </div>

            {/* Canvas Stage Mockup */}
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              {/* Simulated Gameplay Screen */}
              <div className="absolute inset-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-center flex-col p-6 text-center">
                <Activity className="w-12 h-12 text-cyan-500/40 mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-slate-300">{currentScene?.name}</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Active sources: {currentScene?.sources.filter((s) => s.visible).map((s) => s.name).join(', ')}
                </p>
              </div>

              {/* Overlay HUD Badges */}
              <div className="absolute top-6 left-6 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 animate-ping text-emerald-400" />
                GHOSTOS HUD OVERLAY ACTIVE
              </div>

              <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-cyan-400">
                AI CO-HOST LISTENING 🎙️
              </div>
            </div>

            {/* Replay Buffer Quick Trigger Bar */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Instant Replay Buffer (Last 30s)</span>
              <button
                onClick={() => OBSService.saveReplayBuffer()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" /> Save Replay Clip
              </button>
            </div>
          </div>

          {/* Quick Scene Selector */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Quick Scene Switcher
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneSwitch(scene.id)}
                  className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                    scene.active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-600/20 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">{scene.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {scene.sources.length} Sources
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Director & Auto Actions Queue */}
        <div className="space-y-6">
          {/* AI Director Panel */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                AI Director Suggestions
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Gemini Active
              </span>
            </div>

            <div className="space-y-3">
              {actions.map((act) => (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                    act.status === 'approved'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : act.status === 'rejected'
                      ? 'bg-slate-950/40 border-slate-800 opacity-50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{act.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      {act.confidenceScore}% Conf
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{act.description}</p>
                  <p className="text-[10px] text-cyan-400/80 italic">Reason: {act.reasoning}</p>

                  {act.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApproveAction(act.id)}
                        className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectAction(act.id)}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <X className="w-3 h-3" /> Dismiss
                      </button>
                    </div>
                  )}

                  {act.status === 'approved' && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                      <Check className="w-3 h-3" /> Action Dispatched to OBS
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Core Plugins Status Summary */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Plugin Sandbox Status
            </h2>
            <div className="space-y-2">
              {plugins.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300 font-medium">{p.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {p.status.toUpperCase()} ({p.memoryUsageMb}MB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
