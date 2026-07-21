import React, { useState } from 'react';
import { Layers, Copy, Check, ExternalLink, X, Monitor, ShieldAlert, Sparkles } from 'lucide-react';

interface OverlayPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OverlayPreviewModal: React.FC<OverlayPreviewModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const overlaySources = [
    {
      id: 'overlay-chat',
      name: '💬 Multi-Chat Transparent Overlay',
      url: `${appUrl}/#overlay-chat`,
      description: 'Single-monitor transparent chat overlay with twitch/kick merged badges.',
    },
    {
      id: 'overlay-wheel',
      name: '🎡 Wheel Studio Popout Canvas',
      url: `${appUrl}/#overlay-wheel`,
      description: 'Transparent 60fps spin wheel canvas with particle win animations.',
    },
    {
      id: 'overlay-ai',
      name: '🤖 AI Co-Host Avatar & Voice Wave',
      url: `${appUrl}/#overlay-ai`,
      description: 'Animated AI co-host avatar that reacts when AI responds.',
    },
    {
      id: 'overlay-goals',
      name: '🎯 Goal Bars & Milestones',
      url: `${appUrl}/#overlay-goals`,
      description: 'Follower, Subscriber, and Bit progress bars.',
    },
    {
      id: 'overlay-alerts',
      name: '🔔 Alerts & Confetti FX',
      url: `${appUrl}/#overlay-alerts`,
      description: 'Custom subscription, raid, donation, and wheel alert popups.',
    },
    {
      id: 'overlay-timer',
      name: '⏳ Stream Countdown & BRB Timer',
      url: `${appUrl}/#overlay-timer`,
      description: 'Clean countdown timer for stream starting soon or BRB screens.',
    },
  ];

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePopout = (url: string) => {
    window.open(url, '_blank', 'width=1280,height=720,menubar=no,toolbar=no,location=no');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-slate-100 text-base">OBS Browser Source Generator & Popouts</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* OBS Cookie Blocking Resolution Guidance */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              Fix OBS "Browser Blocking Security Cookie" Error
            </div>
            <p className="text-amber-200/80 leading-relaxed text-[11px]">
              If OBS Studio displays a security cookie block warning, click <strong>"Pop Out Standalone Window"</strong> or use the local PC URL (e.g. <code>http://localhost:3000/#overlay-chat</code>). In OBS Browser Source properties, uncheck "Shutdown source when not visible" and click "Interact" to authorize once.
            </p>
          </div>

          {overlaySources.map((source) => (
            <div
              key={source.id}
              className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  {source.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Transparent / 60FPS</span>
              </div>
              <p className="text-[11px] text-slate-400">{source.description}</p>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={source.url}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-400 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(source.id, source.url)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                >
                  {copiedId === source.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => handlePopout(source.url)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                  title="Pop out standalone transparent window"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Pop Out
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
