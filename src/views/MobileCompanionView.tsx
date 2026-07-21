import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  QrCode,
  CheckCircle,
  Video,
  Disc,
  Flame,
  ShieldAlert,
  Wifi,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Send,
  Volume2,
  Radio,
  Mic,
  MicOff,
  Bot,
  Heart,
  Youtube,
  Twitch,
  Twitter,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { OBSService } from '../core/OBSService';
import { AIEngine } from '../core/AIEngine';
import { StorageService } from '../core/StorageService';
import { QRCodeSVG } from '../components/QRCodeSVG';
import { EventBus } from '../core/EventBus';
import { ChatMessage, Platform } from '../types';

export const MobileCompanionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'qr_pairing' | 'live_chat' | 'controls' | 'soundboard'>('live_chat');
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [obsStatus, setObsStatus] = useState(OBSService.getStatus());
  const [creator, setCreator] = useState(StorageService.getCreatorProfile());

  // Multi-Chat state for mobile view
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitch');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [selectedQrTarget, setSelectedQrTarget] = useState<'#mobile-chat' | '#mobile-deck' | '#mobile-soundboard' | '#mobile-wheel' | '#mobile-companion'>('#mobile-chat');

  const companionUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}${selectedQrTarget}`
    : `http://localhost:3000/${selectedQrTarget}`;

  useEffect(() => {
    // Initial mock messages
    const initialMsgs: ChatMessage[] = [
      {
        id: '1',
        platform: 'twitch',
        username: 'NinjaFan99',
        message: 'Yo TJ SINGH! The stream quality is insane today! 🔥',
        timestamp: '12:01',
        badges: ['Subscriber'],
      },
      {
        id: '2',
        platform: 'youtube',
        username: 'GamerGirl_90',
        message: 'Which game are we playing next? Spin the wheel!',
        timestamp: '12:02',
        badges: ['Member'],
      },
      {
        id: '3',
        platform: 'kick',
        username: 'SigmaGrindset',
        message: 'Can the AI co-host roast me please? @GhostOS',
        timestamp: '12:03',
      },
    ];
    setMessages(initialMsgs);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(companionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRemoteTrigger = (actionName: string, actionFn: () => void) => {
    actionFn();
    setLastAction(`Executed action: ${actionName}`);
    setTimeout(() => setLastAction(null), 3000);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      username: 'TJ SINGH (Mobile Host)',
      message: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: ['Streamer'],
    };

    setMessages((prev) => [...prev, newMsg]);
    EventBus.emit('ChatMessage', 'MobileCompanion', newMsg);
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
    EventBus.emit('ChatMessage', 'MobileCompanion', aiMsg);
  };

  const playSoundEffect = (soundName: string) => {
    handleRemoteTrigger(`Played ${soundName}`, () => {
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
        } catch (err) {
          console.log('Web audio synth:', err);
        }
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100">
              GhostOS Mobile Companion & Live Chat
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
              Built by {creator.authorName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scan QR code or use the link on your smartphone to view combined live chat, trigger soundboards, and control stream scenes on the go.
          </p>
        </div>

        {/* Social Links Badge */}
        <div className="flex items-center gap-2 shrink-0 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-300">Creator:</span>
          {creator.youtubeUrl && (
            <a href={creator.youtubeUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-400" title="YouTube">
              <Youtube className="w-4 h-4" />
            </a>
          )}
          {creator.twitchUrl && (
            <a href={creator.twitchUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400" title="Twitch">
              <Twitch className="w-4 h-4" />
            </a>
          )}
          {creator.twitterUrl && (
            <a href={creator.twitterUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-400" title="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {creator.portfolioUrl && (
            <a href={creator.portfolioUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400" title="Portfolio">
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {lastAction && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 shadow-md animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          {lastAction}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('live_chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'live_chat'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Live Combined Multi-Chat
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'controls'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" /> Stream Deck Controls
        </button>

        <button
          onClick={() => setActiveTab('soundboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'soundboard'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Volume2 className="w-4 h-4" /> Mobile Soundboard
        </button>

        <button
          onClick={() => setActiveTab('qr_pairing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'qr_pairing'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" /> Pair Mobile via QR / Link
        </button>
      </div>

      {/* Tab 1: Live Combined Multi-Chat */}
      {activeTab === 'live_chat' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Live Combined Multi-Platform Chat Feed
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time stream chat from Twitch, YouTube, Kick & TikTok. Read and reply directly from your smartphone.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                ● LIVE SYNC
              </span>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div
            ref={chatScrollRef}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-80 overflow-y-auto space-y-3 scrollbar-thin"
          >
            {messages.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Waiting for incoming chat messages...
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-3 group hover:border-cyan-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                        msg.platform === 'twitch' ? 'bg-purple-600/30 text-purple-300' :
                        msg.platform === 'youtube' ? 'bg-red-600/30 text-red-300' :
                        msg.platform === 'kick' ? 'bg-emerald-600/30 text-emerald-300' : 'bg-cyan-600/30 text-cyan-300'
                      }`}>
                        {msg.platform}
                      </span>
                      <span className="font-bold text-xs text-slate-200">{msg.username}</span>
                      {msg.badges && msg.badges.length > 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                          {msg.badges[0]}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{msg.message}</p>
                  </div>

                  <button
                    onClick={() => handleAIRoastMessage(msg)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[10px] font-bold flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-all"
                    title="Generate AI Roast for this chatter"
                  >
                    <Flame className="w-3 h-3 text-rose-400" /> Roast
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Chat Reply Form */}
          <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
            >
              <option value="twitch">Twitch</option>
              <option value="youtube">YouTube</option>
              <option value="kick">Kick</option>
            </select>

            <input
              type="text"
              placeholder="Type message to send to live stream chat..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 w-full"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 w-full sm:w-auto justify-center"
            >
              <Send className="w-3.5 h-3.5" /> Send Chat
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Stream Deck Controls */}
      {activeTab === 'controls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Video className="w-4 h-4 text-cyan-400" />
              OBS Scene Switches
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handleRemoteTrigger('Gaming Scene', () => OBSService.switchScene('🎮 Gaming Main'))
                }
                className="p-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex flex-col items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Video className="w-5 h-5" /> 🎮 Gaming Main
              </button>

              <button
                onClick={() =>
                  handleRemoteTrigger('Chatting Scene', () =>
                    OBSService.switchScene('💬 Just Chatting & AI')
                  )
                }
                className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex flex-col items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Video className="w-5 h-5" /> 💬 Just Chatting
              </button>

              <button
                onClick={() =>
                  handleRemoteTrigger('BRB Scene', () => OBSService.switchScene('⏸️ Be Right Back'))
                }
                className="p-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex flex-col items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Video className="w-5 h-5" /> ⏸️ Be Right Back
              </button>

              <button
                onClick={() =>
                  handleRemoteTrigger('Ending Scene', () => OBSService.switchScene('🏁 Stream Ending'))
                }
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Video className="w-5 h-5" /> 🏁 Stream Ending
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Radio className="w-4 h-4 text-cyan-400" />
              Stream Operations & Emergency Cut
            </h2>

            <div className="space-y-3">
              <button
                onClick={() =>
                  handleRemoteTrigger('Toggle Stream', () => OBSService.toggleStream())
                }
                className={`w-full p-3.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-md transition-all active:scale-98 ${
                  obsStatus.streaming
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  {obsStatus.streaming ? 'STOP LIVE STREAM' : 'START LIVE STREAM'}
                </span>
                <span className="font-mono text-[10px] bg-black/30 px-2 py-0.5 rounded">
                  {obsStatus.streaming ? 'LIVE NOW' : 'OFFLINE'}
                </span>
              </button>

              <button
                onClick={() =>
                  handleRemoteTrigger('Wheel Spin', () => EventBus.emit('WheelFinished', 'Mobile', { winner: 'VIP Prize' }))
                }
                className="w-full p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Disc className="w-4 h-4 text-indigo-300" /> Trigger Prize Wheel Spin
              </button>

              <button
                onClick={() =>
                  handleRemoteTrigger('AI Roast', () => AIEngine.generateRoast('Chatter').then((r) => alert(r)))
                }
                className="w-full p-3 rounded-xl bg-rose-600/30 border border-rose-500/50 hover:bg-rose-600/50 text-rose-200 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Flame className="w-4 h-4 text-rose-400" /> Dispatch AI Chat Roast
              </button>

              <button
                onClick={() => handleRemoteTrigger('Emergency Cut', () => OBSService.toggleStream())}
                className="w-full p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all mt-4"
              >
                <ShieldAlert className="w-4 h-4" /> 🚨 EMERGENCY STREAM CUT 🚨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Mobile Soundboard */}
      {activeTab === 'soundboard' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                1-Touch Instant Soundboard Deck
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tap any sound effect to play directly to stream audio routing or mobile device.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: '🎺 Air Horn Blast', cat: 'Hype', color: 'bg-indigo-600 hover:bg-indigo-500' },
              { name: '🏆 Victory Fanfare', cat: 'Hype', color: 'bg-emerald-600 hover:bg-emerald-500' },
              { name: '😂 Sitcom Laugh', cat: 'Comedy', color: 'bg-amber-600 hover:bg-amber-500' },
              { name: '💥 Vine Boom', cat: 'Meme', color: 'bg-rose-600 hover:bg-rose-500' },
              { name: '🤦 Bruh Sound Effect', cat: 'Meme', color: 'bg-cyan-600 hover:bg-cyan-500' },
              { name: '🚨 Police Siren', cat: 'GTA RP', color: 'bg-blue-600 hover:bg-blue-500' },
              { name: '💰 Cash Register', cat: 'Economy', color: 'bg-teal-600 hover:bg-teal-500' },
              { name: '🥁 Rimshot Ba-Dum-Tss', cat: 'Comedy', color: 'bg-purple-600 hover:bg-purple-500' },
            ].map((snd, idx) => (
              <button
                key={idx}
                onClick={() => playSoundEffect(snd.name)}
                className={`p-4 rounded-2xl ${snd.color} text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95`}
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-center">{snd.name}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/30 font-mono">
                  {snd.cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: QR Pairing & Copyable Link */}
      {activeTab === 'qr_pairing' && (
        <div className="space-y-6">
          {/* Target Tool Mode Selector */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" /> Choose Standalone Feature for Mobile Link / QR Code
            </h3>
            <p className="text-xs text-slate-400">
              Select which specific feature should open when you scan the QR code or click the URL. Dedicated views open isolated full-screen tools with no desktop UI elements.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { id: '#mobile-chat', label: '💬 Combined Chat Only', desc: 'Live multi-chat feed & AI roast' },
                { id: '#mobile-deck', label: '🎮 Stream Deck Only', desc: 'Scene switcher & emergency stop' },
                { id: '#mobile-soundboard', label: '🔊 Soundboard Only', desc: '1-touch audio effect triggers' },
                { id: '#mobile-wheel', label: '🎡 Prize Wheel Only', desc: 'Spin wheel & prize triggers' },
                { id: '#mobile-companion', label: '📱 Full Admin Suite', desc: 'Complete GhostOS Mobile Suite' },
              ].map((target) => (
                <button
                  key={target.id}
                  onClick={() => setSelectedQrTarget(target.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                    selectedQrTarget === target.id
                      ? 'bg-slate-950 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs">{target.label}</span>
                  <span className="text-[10px] text-slate-500 leading-tight">{target.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* QR Code Card */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-cyan-400" />
                Scan QR Code ({selectedQrTarget})
              </h2>
              <p className="text-xs text-slate-400">
                Point your iPhone or Android camera at this QR code to open the <strong className="text-cyan-300">{selectedQrTarget}</strong> view directly.
              </p>

              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <QRCodeSVG value={companionUrl} size={210} />
                <div className="text-center">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold block">
                    ● ISO QR Code for {selectedQrTarget}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1 mt-1">
                    <Wifi className="w-3 h-3 text-emerald-400" /> Scans instantly on iOS & Android camera
                  </span>
                </div>
              </div>
            </div>

          {/* Full Link Input & Copy Controls */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Copy className="w-4 h-4 text-cyan-400" />
                Full Visible Mobile Companion Link
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Copy or share this direct URL to access GhostOS Mobile Controller on any phone or browser tab.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Complete Active Companion URL:
              </label>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={companionUrl}
                  className="w-full bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleCopyLink}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    copiedLink
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copied Link to Clipboard!' : 'Copy Mobile URL'}
                </button>

                <a
                  href={companionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open Link in New Tab
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <h3 className="font-bold text-slate-200">How to use on your Mobile Device:</h3>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Scan the QR code with your smartphone camera.</li>
                <li>Or copy the link above and paste it into Safari or Chrome on your phone.</li>
                <li>Chat messages sync in real time across desktop & mobile.</li>
                <li>Bookmark the link on your phone screen to use it like a native Stream Deck app!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};
