import React, { useState, useEffect } from 'react';
import { MessageSquare, Disc, Bot, Bell, Award, Timer, Camera } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { PolaroidOverlayComponent } from '../components/PolaroidOverlayComponent';

interface StandaloneOverlayViewProps {
  type: string;
}

export const StandaloneOverlayView: React.FC<StandaloneOverlayViewProps> = ({ type }) => {
  const [messages, setMessages] = useState<any[]>([
    { id: '1', username: 'VipViewer99', message: 'Hype stream! 🔥', platform: 'twitch', isVIP: true },
    { id: '2', username: 'KickRider', message: 'Let’s goooo 🚀', platform: 'kick', isSubscriber: true },
  ]);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeMeme, setActiveMeme] = useState<{
    title: string;
    videoUrl?: string;
    durationSeconds?: number;
  } | null>(null);

  useEffect(() => {
    const unsub = EventBus.subscribe('ChatMessage', (evt) => {
      setMessages((prev) => [evt.payload, ...prev.slice(0, 10)]);
    });

    const unsubAlerts = EventBus.subscribe('AlertTriggered', (evt) => {
      setAlerts((prev) => [evt.payload, ...prev.slice(0, 3)]);
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a !== evt.payload));
      }, 5000);
    });

    const unsubMemes = EventBus.subscribe('MemeVideoTriggered', (evt) => {
      setActiveMeme(evt.payload);
      const durationMs = (evt.payload.durationSeconds || 5) * 1000;
      setTimeout(() => {
        setActiveMeme(null);
      }, durationMs);
    });

    return () => {
      unsub();
      unsubAlerts();
      unsubMemes();
    };
  }, []);

  if (type === '#overlay-polaroid') {
    return <PolaroidOverlayComponent />;
  }

  if (type === '#overlay-chat') {
    return (
      <div className="p-4 bg-transparent text-white font-sans max-w-sm space-y-2">
        <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> Live Chat Overlay
        </div>
        {messages.map((m) => (
          <div
            key={m.id}
            className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-xs shadow-lg animate-fade-in"
          >
            <span className="font-bold text-cyan-300 mr-2">@{m.username}:</span>
            <span className="text-slate-100">{m.message}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === '#overlay-wheel') {
    return (
      <div className="p-8 bg-transparent flex flex-col items-center justify-center min-h-screen text-white font-sans">
        <div className="w-80 h-80 rounded-full border-8 border-cyan-500/80 bg-slate-950/90 shadow-2xl flex items-center justify-center relative animate-pulse">
          <Disc className="w-32 h-32 text-cyan-400 animate-spin" />
          <span className="absolute bottom-6 text-xs font-bold font-mono text-cyan-300">
            OBS STANDALONE WHEEL
          </span>
        </div>
      </div>
    );
  }

  if (type === '#overlay-ai') {
    return (
      <div className="p-6 bg-transparent text-white font-sans max-w-md">
        <div className="p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center animate-bounce shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-indigo-300">GhostOS AI Co-Host</h4>
            <p className="text-xs text-slate-200 mt-0.5">"I'm monitoring live chat and ready to roast!"</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === '#overlay-alerts') {
    return (
      <div className="p-6 bg-transparent text-white font-sans flex flex-col items-center justify-center min-h-screen">
        {alerts.length === 0 ? (
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
            🔔 Waiting for alerts...
          </div>
        ) : (
          alerts.map((a, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 text-white font-bold text-lg shadow-2xl animate-bounce flex items-center gap-3"
            >
              <Bell className="w-8 h-8 text-yellow-300 animate-spin" />
              <div>
                <div className="text-xs uppercase tracking-widest text-amber-200">NEW STREAM ALERT</div>
                <div>{a.title || 'NEW SUBSCRIBER! 🎉'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (type === '#overlay-meme' || type === '#overlay-video') {
    return (
      <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 pointer-events-none z-50">
        {activeMeme ? (
          <div className="relative flex flex-col items-center justify-center animate-bounce-in">
            {activeMeme.videoUrl && (activeMeme.videoUrl.endsWith('.mp4') || activeMeme.videoUrl.endsWith('.webm')) ? (
              <video
                src={activeMeme.videoUrl}
                autoPlay
                playsInline
                className="max-w-xl max-h-[70vh] rounded-2xl shadow-2xl border-4 border-cyan-400 object-contain bg-black/40"
              />
            ) : (
              <div className="p-6 rounded-3xl bg-slate-950/90 border-4 border-cyan-400 shadow-2xl flex flex-col items-center gap-3 text-center">
                <div className="text-4xl animate-bounce">🎬 🔥</div>
                <div className="text-xl font-black text-cyan-300 uppercase tracking-widest drop-shadow-md">
                  {activeMeme.title || 'MEME OVERLAY TRIGGERED!'}
                </div>
                {activeMeme.videoUrl && (
                  <img
                    src={activeMeme.videoUrl}
                    alt="Meme GIF"
                    className="max-w-md max-h-[50vh] rounded-xl object-contain border border-cyan-500/30"
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-950/70 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-400 opacity-60 backdrop-blur">
            🎬 OBS Standalone Meme Overlay (#overlay-meme) - Ready & Waiting
          </div>
        )}
      </div>
    );
  }
};
