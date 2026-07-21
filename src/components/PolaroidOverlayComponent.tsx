import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Zap, Award, Film, CheckCircle2 } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import {
  PolaroidRequest,
  DEFAULT_POLAROID_THEMES,
  PolaroidTheme,
  PolaroidRarity,
} from '../core/PolaroidEngine';
import { PlatformLogo } from './PlatformLogo';

export const PolaroidOverlayComponent: React.FC = () => {
  const [activeItem, setActiveItem] = useState<PolaroidRequest | null>(null);
  const [stage, setStage] = useState<'idle' | 'flash' | 'eject' | 'developing' | 'complete'>('idle');
  const [developProgress, setDevelopProgress] = useState<number>(0);

  useEffect(() => {
    // 1. Capture Event -> Trigger Camera Flash
    const unsubCaptured = EventBus.subscribe('PolaroidCaptured', (evt) => {
      const item: PolaroidRequest = evt.payload;
      setActiveItem(item);
      setStage('flash');
      setDevelopProgress(0);

      // Flash -> Eject transition
      setTimeout(() => {
        setStage('eject');
      }, 400);
    });

    // 2. Developing Event -> Animate progress
    const unsubDev = EventBus.subscribe('PolaroidDeveloping', (evt) => {
      const durationMs = evt.payload?.developDurationMs || 3500;
      setStage('developing');

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.floor((elapsed / durationMs) * 100));
        setDevelopProgress(pct);

        if (pct >= 100) {
          clearInterval(interval);
          setStage('complete');
        }
      }, 50);
    });

    // 3. Completed Event -> Auto Hide
    const unsubComp = EventBus.subscribe('PolaroidCompleted', () => {
      setTimeout(() => {
        setStage('idle');
        setActiveItem(null);
      }, 3500);
    });

    return () => {
      unsubCaptured();
      unsubDev();
      unsubComp();
    };
  }, []);

  if (stage === 'idle' || !activeItem) {
    return null;
  }

  // Theme resolution
  const theme: PolaroidTheme =
    DEFAULT_POLAROID_THEMES.find((t) => t.id === activeItem.themeId) || DEFAULT_POLAROID_THEMES[0];

  // Rarity Frame Styling
  const getRarityGlow = (rarity: PolaroidRarity) => {
    switch (rarity) {
      case 'legendary':
        return 'ring-4 ring-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.8)] animate-pulse';
      case 'epic':
        return 'ring-4 ring-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.7)]';
      case 'rare':
        return 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)]';
      case 'uncommon':
        return 'ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]';
      case 'streamer':
        return 'ring-4 ring-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.9)] animate-bounce';
      default:
        return 'shadow-2xl';
    }
  };

  const rarityBadgeColor = (rarity: PolaroidRarity) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black';
      case 'epic':
        return 'bg-purple-600 text-purple-100 font-bold';
      case 'rare':
        return 'bg-cyan-600 text-cyan-100 font-bold';
      case 'uncommon':
        return 'bg-emerald-600 text-emerald-100 font-bold';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden font-sans">
      {/* 1. Camera Flash FX */}
      {stage === 'flash' && (
        <div className="absolute inset-0 bg-white animate-ping opacity-90 z-50 flex items-center justify-center">
          <div className="p-8 rounded-full bg-cyan-400/30 backdrop-blur-xl">
            <Camera className="w-24 h-24 text-cyan-950 animate-bounce" />
          </div>
        </div>
      )}

      {/* 2. Realistic Animated Camera Body & Polaroid Slide Out */}
      <div className="relative flex flex-col items-center">
        {/* Virtual Polaroid Camera Top Lens */}
        <div className="w-80 h-16 bg-slate-900 border-2 border-slate-700 rounded-t-3xl flex items-center justify-between px-6 shadow-2xl relative z-20">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              GHOSTOS CAM
            </span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 bg-slate-950 flex items-center justify-center shadow-inner">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Polaroid Ejecting Frame Container */}
        <div
          className={`transition-all duration-700 transform ${
            stage === 'eject'
              ? '-translate-y-4 scale-95 opacity-80'
              : 'translate-y-0 scale-100 opacity-100'
          }`}
        >
          {/* Main Polaroid Photo Frame */}
          <div
            className={`w-80 sm:w-96 p-4 rounded-2xl relative flex flex-col items-center transition-all duration-500 ${getRarityGlow(
              activeItem.rarity
            )}`}
            style={{
              background: theme.frameBg,
              borderWidth: '2px',
              borderColor: theme.borderColor,
            }}
          >
            {/* Rare Rarity Badge Ribbons */}
            {activeItem.rarity !== 'common' && (
              <div className="absolute -top-3 left-6 z-30">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider shadow-lg flex items-center gap-1 ${rarityBadgeColor(
                    activeItem.rarity
                  )}`}
                >
                  <Sparkles className="w-3 h-3" />
                  {activeItem.rarity} EDITION
                </span>
              </div>
            )}

            {/* Photo Canvas / Image Display */}
            <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-slate-950 relative border border-slate-800 shadow-inner">
              {/* Captured Stream Snapshot */}
              <img
                src={activeItem.imageDataUrl}
                alt="Stream Polaroid"
                className="w-full h-full object-cover transition-all duration-1000"
                style={{
                  filter: stage === 'developing' ? `blur(${(100 - developProgress) / 10}px) grayscale(${100 - developProgress}%)` : theme.filterCss || 'none',
                  opacity: Math.max(0.1, developProgress / 100),
                }}
              />

              {/* Developing Overlay Shimmer */}
              {stage === 'developing' && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                  <Film className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    DEVELOPING FILM... {developProgress}%
                  </span>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-100"
                      style={{ width: `${developProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Holographic Watermark / Platform Icon */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur border border-slate-700/80 flex items-center gap-1">
                <PlatformLogo platform={activeItem.platform} size="sm" showLabel />
              </div>
            </div>

            {/* Polaroid Bottom Paper Area (Handwritten style metadata) */}
            <div className="w-full mt-3 flex items-end justify-between px-1">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-sm font-black tracking-tight"
                    style={{ color: theme.textColor }}
                  >
                    @{activeItem.username}
                  </span>
                  {activeItem.customCaption && (
                    <span className="text-xs italic opacity-80" style={{ color: theme.textColor }}>
                      "{activeItem.customCaption}"
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono opacity-70 flex items-center gap-2" style={{ color: theme.textColor }}>
                  <span>📅 {activeItem.dateStr}</span>
                  <span>⏰ {activeItem.timeStr}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono font-bold uppercase opacity-80 tracking-widest block" style={{ color: theme.textColor }}>
                  {theme.name}
                </span>
                <span className="text-[8px] font-mono opacity-50 block" style={{ color: theme.textColor }}>
                  GHOSTOS #POLAROID
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
