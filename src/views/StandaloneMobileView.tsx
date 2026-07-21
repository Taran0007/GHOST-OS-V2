import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Radio,
  Volume2,
  Disc,
  Smartphone,
  Flame,
  Send,
  Video,
  CheckCircle,
  ShieldAlert,
  Bot,
  Zap,
  Wifi,
  Heart,
  Youtube,
  Twitch,
  Twitter,
  Globe,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { OBSService } from '../core/OBSService';
import { AIEngine } from '../core/AIEngine';
import { StorageService } from '../core/StorageService';
import { EventBus } from '../core/EventBus';
import { ChatMessage, Platform } from '../types';
import { PlatformLogo } from '../components/PlatformLogo';

interface StandaloneMobileViewProps {
  mode: string; // '#mobile-chat' | '#mobile-deck' | '#mobile-soundboard' | '#mobile-wheel' | '#mobile-admin'
}

export const StandaloneMobileView: React.FC<StandaloneMobileViewProps> = ({ mode }) => {
  const [obsStatus, setObsStatus] = useState(OBSService.getStatus());
  const [creator, setCreator] = useState(StorageService.getCreatorProfile());
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Multi-Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      platform: 'twitch',
      username: 'GamerGod_99',
      message: 'Yo TJ SINGH! The stream setup looks insane today! 🔥',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: ['Subscriber'],
    },
    {
      id: '2',
      platform: 'youtube',
      username: 'AstroGirl',
      message: 'Can we spin the prize wheel next? 🎡',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: ['Member'],
    },
    {
      id: '3',
      platform: 'kick',
      username: 'SigmaGrind',
      message: 'GhostAI roast me please! @GhostOS',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitch');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubChat = EventBus.subscribe('ChatMessage', (evt) => {
      setMessages((prev) => [...prev.slice(-49), evt.payload]);
    });

    const unsubCreator = EventBus.subscribe('CreatorProfileUpdated', (evt) => {
      if (evt.payload?.creator) setCreator(evt.payload.creator);
    });

    const interval = setInterval(() => {
      setObsStatus(OBSService.getStatus());
    }, 1000);

    return () => {
      unsubChat();
      unsubCreator();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRemoteTrigger = (actionName: string, actionFn: () => void) => {
    actionFn();
    setLastAction(`Executed: ${actionName}`);
    setTimeout(() => setLastAction(null), 3000);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      username: `${creator.authorName} (Mobile)`,
      message: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: ['Streamer'],
    };

    setMessages((prev) => [...prev, newMsg]);
    EventBus.emit('ChatMessage', 'StandaloneMobile', newMsg);
    setInputMessage('');
  };

  const handleAIRoastMessage = async (msg: ChatMessage) => {
    const roast = await AIEngine.generateRoast(msg.username);
    const aiMsg: ChatMessage = {
      id: Date.now().toString(),
      platform: 'system',
      username: '🤖 GhostAI Co-Host',
      message: `🔥 ROAST for @${msg.username}: ${roast}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, aiMsg]);
    EventBus.emit('ChatMessage', 'StandaloneMobile', aiMsg);
  };

  const playSoundEffect = (soundName: string) => {
    handleRemoteTrigger(`Sound: ${soundName}`, () => {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          if (soundName.includes('Air Horn') || soundName.includes('Horn')) {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
          } else if (soundName.includes('Victory') || soundName.includes('Fanfare')) {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
          } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
          }

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch {}
      }
    });
  };

  // STANDALONE MODE 1: Dedicated Fullscreen Combined Live Chat (#mobile-chat)
  if (mode === '#mobile-chat') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans p-3 sm:p-4">
        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <div>
              <h1 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                Live Combined Multi-Chat
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  {creator.authorName}
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">Synced with Twitch, YouTube, Kick & TikTok</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">LIVE SYNC</span>
          </div>
        </div>

        {/* Message Feed */}
        <div
          ref={chatScrollRef}
          className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 overflow-y-auto space-y-2.5 mb-3 min-h-[60vh] max-h-[75vh]"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <PlatformLogo platform={msg.platform} size="sm" showLabel />
                  <span className="font-bold text-xs text-slate-100">{msg.username}</span>
                  {msg.badges && msg.badges.length > 0 && (
                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                      {msg.badges[0]}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{msg.message}</p>
              </div>

              <button
                onClick={() => handleAIRoastMessage(msg)}
                className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[9px] font-bold flex items-center gap-1 shrink-0"
                title="Roast user with AI"
              >
                <Flame className="w-3 h-3 text-rose-400" /> Roast
              </button>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-[11px] text-slate-200 font-bold focus:outline-none"
          >
            <option value="twitch">Twitch</option>
            <option value="youtube">YouTube</option>
            <option value="kick">Kick</option>
          </select>

          <input
            type="text"
            placeholder="Type reply to stream chat..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  // STANDALONE MODE 2: Dedicated Fullscreen Stream Deck Controller (#mobile-deck)
  if (mode === '#mobile-deck') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans p-4 space-y-4">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <div>
              <h1 className="text-xs font-bold text-slate-100">Standalone Stream Deck</h1>
              <p className="text-[10px] text-slate-400">Touch Controller for {creator.authorName}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
            OBS WEBSOCKET ACTIVE
          </span>
        </div>

        {lastAction && (
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            {lastAction}
          </div>
        )}

        {/* Scene Switches Grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          <button
            onClick={() =>
              handleRemoteTrigger('Gaming Scene', () => OBSService.switchScene('🎮 Gaming Main'))
            }
            className="p-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm flex flex-col items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Video className="w-7 h-7" /> 🎮 Gaming Main
          </button>

          <button
            onClick={() =>
              handleRemoteTrigger('Chatting Scene', () =>
                OBSService.switchScene('💬 Just Chatting & AI')
              )
            }
            className="p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex flex-col items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Video className="w-7 h-7" /> 💬 Just Chatting
          </button>

          <button
            onClick={() =>
              handleRemoteTrigger('BRB Scene', () => OBSService.switchScene('⏸️ Be Right Back'))
            }
            className="p-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex flex-col items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Video className="w-7 h-7" /> ⏸️ Be Right Back
          </button>

          <button
            onClick={() =>
              handleRemoteTrigger('Ending Scene', () => OBSService.switchScene('🏁 Stream Ending'))
            }
            className="p-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex flex-col items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Video className="w-7 h-7" /> 🏁 Stream Ending
          </button>
        </div>

        {/* Big Emergency Stream Button */}
        <button
          onClick={() => handleRemoteTrigger('Emergency Cut', () => OBSService.toggleStream())}
          className="w-full p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 active:scale-98 transition-all"
        >
          <ShieldAlert className="w-5 h-5" /> 🚨 EMERGENCY STREAM CUT 🚨
        </button>
      </div>
    );
  }

  // STANDALONE MODE 3: Dedicated Fullscreen Mobile Soundboard (#mobile-soundboard)
  if (mode === '#mobile-soundboard') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans p-4 space-y-4">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <div>
              <h1 className="text-xs font-bold text-slate-100">Standalone Stream Soundboard</h1>
              <p className="text-[10px] text-slate-400">1-Touch Audio Triggers for {creator.authorName}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
            AUDIO ROUTED
          </span>
        </div>

        {lastAction && (
          <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-xs text-purple-200 font-bold flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
            {lastAction}
          </div>
        )}

        {/* 1-Touch Sound Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {[
            { name: '🎺 Air Horn Blast', cat: 'Hype', color: 'bg-indigo-600' },
            { name: '🏆 Victory Fanfare', cat: 'Hype', color: 'bg-emerald-600' },
            { name: '😂 Sitcom Laugh', cat: 'Comedy', color: 'bg-amber-600' },
            { name: '💥 Vine Boom', cat: 'Meme', color: 'bg-rose-600' },
            { name: '🤦 Bruh Sound', cat: 'Meme', color: 'bg-cyan-600' },
            { name: '🚨 Police Siren', cat: 'GTA RP', color: 'bg-blue-600' },
            { name: '💰 Cash Register', cat: 'Economy', color: 'bg-teal-600' },
            { name: '🥁 Rimshot Ba-Dum-Tss', cat: 'Comedy', color: 'bg-purple-600' },
          ].map((snd, idx) => (
            <button
              key={idx}
              onClick={() => playSoundEffect(snd.name)}
              className={`p-4 rounded-2xl ${snd.color} text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all`}
            >
              <Volume2 className="w-6 h-6" />
              <span className="text-center">{snd.name}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/30 font-mono">
                {snd.cat}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // STANDALONE MODE 4: Dedicated Fullscreen Wheel Controller (#mobile-wheel)
  if (mode === '#mobile-wheel') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans p-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-emerald-400" />
            <div>
              <h1 className="text-xs font-bold text-slate-100">Standalone Prize Wheel</h1>
              <p className="text-[10px] text-slate-400">Trigger Spins for {creator.authorName}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
            OVERLAY SYNCED
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-6">
          <div className="w-48 h-48 rounded-full border-4 border-emerald-500/80 bg-slate-950 flex items-center justify-center relative shadow-2xl animate-pulse">
            <Disc className="w-24 h-24 text-emerald-400 animate-spin" />
            <span className="absolute bottom-4 text-[10px] font-bold font-mono text-emerald-300">
              PRIZE WHEEL READY
            </span>
          </div>

          <button
            onClick={() =>
              handleRemoteTrigger('Wheel Spin', () =>
                EventBus.emit('WheelFinished', 'Mobile', { winner: 'VIP Sub Reward' })
              )
            }
            className="w-full max-w-xs py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Disc className="w-5 h-5" /> SPIN PRIZE WHEEL NOW
          </button>
        </div>
      </div>
    );
  }

  // Fallback to complete mobile view
  return null;
};
