import React, { useState, useEffect } from 'react';
import {
  Radio,
  Video,
  Bot,
  Volume2,
  Search,
  QrCode,
  AlertOctagon,
  Palette,
  Sparkles,
  Layers,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { OBSService } from '../core/OBSService';
import { EventBus } from '../core/EventBus';
import { ThemeEngine, GHOST_THEMES } from '../core/ThemeEngine';
import { ThemeId } from '../types';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenMobileQR: () => void;
  onOpenOverlayPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenMobileQR,
  onOpenOverlayPreview,
}) => {
  const [obsStatus, setObsStatus] = useState(OBSService.getStatus());
  const [activeTheme, setActiveTheme] = useState(ThemeEngine.getActiveTheme());
  const [lastEvent, setLastEvent] = useState<string>('System Initialized');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setObsStatus(OBSService.getStatus());
    }, 1000);

    const unsubscribe = EventBus.subscribe('*', (event) => {
      setLastEvent(`${event.type} (${event.source})`);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const handleToggleStream = () => {
    OBSService.toggleStream();
    setObsStatus(OBSService.getStatus());
  };

  const handleToggleRecording = () => {
    OBSService.toggleRecording();
    setObsStatus(OBSService.getStatus());
  };

  const handleThemeChange = (id: ThemeId) => {
    ThemeEngine.setTheme(id);
    setActiveTheme(ThemeEngine.getActiveTheme());
    setIsThemeMenuOpen(false);
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-100 text-lg tracking-wide">GhostOS</h1>
              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v1.0 MASTER
              </span>
              <span className="hidden xl:inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-300 border border-indigo-500/30">
                Built by TJ SINGH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Event Bus: <span className="text-slate-300 font-mono">{lastEvent}</span>
            </p>
          </div>
        </div>

        {/* OBS Stream & Rec Controls */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800">
          <button
            onClick={handleToggleStream}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              obsStatus.streaming
                ? 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {obsStatus.streaming ? `LIVE (${formatUptime(obsStatus.uptimeSeconds)})` : 'START STREAM'}
          </button>

          <button
            onClick={handleToggleRecording}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              obsStatus.recording
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            {obsStatus.recording ? 'REC ON' : 'REC'}
          </button>
        </div>
      </div>

      {/* Center Command Palette Search Bar */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 text-slate-400 text-xs transition-all w-80 justify-between group shadow-inner"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          Search plugins, roasts, flow actions...
        </span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
          Ctrl+K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Browser Source Popout */}
        <button
          onClick={onOpenOverlayPreview}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-all"
          title="Browser Source Manager & Overlay Popouts"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Mobile Companion QR */}
        <button
          onClick={onOpenMobileQR}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 border border-slate-700 transition-all"
          title="Mobile Companion Link & QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Theme Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-all flex items-center gap-1.5"
            title="Theme Engine"
          >
            <Palette className="w-4 h-4" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/80 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                Select GhostOS Theme
              </div>
              {GHOST_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    activeTheme.id === theme.id ? 'text-cyan-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                  }`}
                >
                  <span>{theme.name}</span>
                  {activeTheme.id === theme.id && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* OBS Connected Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          OBS 60FPS
        </div>
      </div>
    </header>
  );
};
