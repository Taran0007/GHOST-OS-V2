import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Volume2,
  Keyboard,
  Smartphone,
  Download,
  CheckCircle,
  Sliders,
  Power,
  ShieldAlert,
  Cpu,
  Mic,
  Radio,
  Save,
} from 'lucide-react';
import { StorageService } from '../core/StorageService';
import { AudioSettings, HotkeyConfig, DesktopConfig } from '../types';

export const DesktopAndAudioView: React.FC = () => {
  const [audio, setAudio] = useState<AudioSettings>(StorageService.getAudioSettings());
  const [hotkeys, setHotkeys] = useState<HotkeyConfig>(StorageService.getHotkeys());
  const [desktop, setDesktop] = useState<DesktopConfig>(StorageService.getDesktopConfig());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setStatusMsg('🎉 Installed GhostOS as PC Desktop App!');
      }
      setDeferredPrompt(null);
    } else {
      alert('🖥️ GhostOS Hybrid Desktop App is active! To install on your PC, click "Add to Desktop / Install App" in your browser options menu or run the launcher script.');
    }
  };

  const updateDesktop = (updates: Partial<DesktopConfig>) => {
    setDesktop((prev) => {
      const next = { ...prev, ...updates };
      StorageService.saveDesktopConfig(next);
      return next;
    });
    setStatusMsg('✅ Saved Desktop App settings');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const updateAudio = (updates: Partial<AudioSettings>) => {
    setAudio((prev) => {
      const next = { ...prev, ...updates };
      StorageService.saveAudioSettings(next);
      return next;
    });
    setStatusMsg('✅ Saved Audio settings');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const updateHotkeys = (updates: Partial<HotkeyConfig>) => {
    setHotkeys((prev) => {
      const next = { ...prev, ...updates };
      StorageService.saveHotkeys(next);
      return next;
    });
    setStatusMsg('✅ Saved Hotkeys keybindings');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleSaveAll = () => {
    StorageService.saveAudioSettings(audio);
    StorageService.saveHotkeys(hotkeys);
    StorageService.saveDesktopConfig(desktop);
    setStatusMsg('✅ Saved Desktop, Audio & Hotkey configurations!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            Hybrid PC App, Audio & Hotkey Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure desktop companion options, system tray, audio ducking, soundboard routing, and global hotkeys. All edits auto-save.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 shrink-0"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            {statusMsg}
          </div>
          <span className="text-[10px] text-emerald-400/70 uppercase tracking-widest">Real-time Persisted</span>
        </div>
      )}

      {/* Grid: Desktop App Options | Audio Mixer | Hotkeys */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Hybrid PC Desktop & System Tray */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Hybrid PC Desktop App
            </h2>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">Electron PC Native App</span>
                  <span className="text-[10px] text-slate-400">Windows / macOS / Linux System Tray</span>
                </div>
                <button
                  onClick={() => {
                    if ((window as any).electronAPI) {
                      (window as any).electronAPI.minimizeToTray();
                    } else {
                      alert('🖥️ GhostOS includes full Electron PC support!\n\nTo run locally in native Electron PC window:\n1. Download/export project\n2. Run "npm install"\n3. Run "npx electron electron/main.cjs"');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> {(window as any).electronAPI ? 'Minimize to Tray' : 'PC Native App'}
                </button>
              </div>
              <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/80">
                Run on PC: <code className="text-cyan-300">npm run electron:start</code>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Launch GhostOS on System Boot</span>
                <input
                  type="checkbox"
                  checked={desktop.startWithOS}
                  onChange={(e) => updateDesktop({ startWithOS: e.target.checked })}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Minimize to System Tray</span>
                <input
                  type="checkbox"
                  checked={desktop.minimizeToTray}
                  onChange={(e) => updateDesktop({ minimizeToTray: e.target.checked })}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Global Keyboard Hotkeys</span>
                <input
                  type="checkbox"
                  checked={desktop.globalHotkeysActive}
                  onChange={(e) => updateDesktop({ globalHotkeysActive: e.target.checked })}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">GPU Hardware Acceleration</span>
                <input
                  type="checkbox"
                  checked={desktop.hardwareAcceleration}
                  onChange={(e) => updateDesktop({ hardwareAcceleration: e.target.checked })}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveAll()}
            className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" /> Save Desktop App Settings
          </button>
        </div>

        {/* Card 2: Audio Master & Processing */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Audio Devices & Routing
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Microphone Input Device</label>
                <select
                  value={audio.micDevice}
                  onChange={(e) => updateAudio({ micDevice: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="Default System Microphone">Default System Microphone</option>
                  <option value="Shure SM7B (USB Audio Interface)">Shure SM7B (USB Audio Interface)</option>
                  <option value="Elgato Wave 3 Mic">Elgato Wave 3 Mic</option>
                  <option value="Rode NT-USB Mini">Rode NT-USB Mini</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Master Stream Volume</span>
                  <span className="font-mono text-cyan-400">{audio.masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.masterVolume}
                  onChange={(e) => updateAudio({ masterVolume: Number(e.target.value) })}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Soundboard Volume</span>
                  <span className="font-mono text-amber-400">{audio.soundboardVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.soundboardVolume}
                  onChange={(e) => updateAudio({ soundboardVolume: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Auto Audio Ducking</span>
                  <input
                    type="checkbox"
                    checked={audio.duckingEnabled}
                    onChange={(e) => updateAudio({ duckingEnabled: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Automatically lowers game volume when you or AI co-host speaks.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveAll()}
            className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" /> Save Audio Settings
          </button>
        </div>

        {/* Card 3: Hotkey Binder */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-purple-400" />
              Keyboard Hotkey Keybindings
            </h2>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] block mb-0.5">Gaming Scene Hotkey</label>
                <input
                  type="text"
                  value={hotkeys.sceneGaming}
                  onChange={(e) => updateHotkeys({ sceneGaming: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-0.5">Chatting Scene Hotkey</label>
                <input
                  type="text"
                  value={hotkeys.sceneChatting}
                  onChange={(e) => updateHotkeys({ sceneChatting: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-0.5">Spin Wheel Hotkey</label>
                <input
                  type="text"
                  value={hotkeys.spinWheel}
                  onChange={(e) => updateHotkeys({ spinWheel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-0.5">AI Roast Hotkey</label>
                <input
                  type="text"
                  value={hotkeys.triggerAIRoast}
                  onChange={(e) => updateHotkeys({ triggerAIRoast: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-0.5">Emergency Stream Cut</label>
                <input
                  type="text"
                  value={hotkeys.emergencyStop}
                  onChange={(e) => updateHotkeys({ emergencyStop: e.target.value })}
                  className="w-full bg-slate-950 border border-rose-900/50 rounded-xl px-3 py-1.5 text-rose-300 font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveAll()}
            className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <Save className="w-3.5 h-3.5 text-purple-400" /> Save Hotkeys Keybindings
          </button>
        </div>
      </div>
    </div>
  );
};

