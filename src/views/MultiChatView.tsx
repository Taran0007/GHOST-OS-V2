import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Pin,
  Shield,
  Eye,
  Filter,
  Monitor,
  Check,
  Flame,
  Volume2,
  Coins,
  Megaphone,
  Clock,
  Award,
  X,
  UserCheck,
  Bot,
} from 'lucide-react';
import { ChatMessage, Platform } from '../types';
import { AIEngine } from '../core/AIEngine';
import { EconomyEngine } from '../core/EconomyEngine';
import { EventBus } from '../core/EventBus';
import { PlatformLogo } from '../components/PlatformLogo';

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    platform: 'twitch',
    username: 'GhostRider99',
    userColor: '#a855f7',
    badges: ['sub', 'vip'],
    message: 'That GTA RP getaway chase was absolutely insane!! KEKW PogChamp',
    timestamp: '09:42:10',
    isSubscriber: true,
    isVIP: true,
    sentiment: 'hype',
  },
  {
    id: 'm-2',
    platform: 'kick',
    username: 'CyberNinja_X',
    userColor: '#22c55e',
    badges: ['mod'],
    message: 'Spin the wheel! We reached 15,000 points in channel rewards!',
    timestamp: '09:42:15',
    isMod: true,
    sentiment: 'positive',
  },
  {
    id: 'm-3',
    platform: 'youtube',
    username: 'PixelQueen',
    userColor: '#ef4444',
    badges: ['member'],
    message: 'Asking Don Ghostino for a job in the nightclub RP business 😎',
    timestamp: '09:42:22',
    isSubscriber: true,
    sentiment: 'positive',
  },
  {
    id: 'm-4',
    platform: 'discord',
    username: 'ViperGamer_99',
    userColor: '#3b82f6',
    badges: ['booster'],
    message: 'Stream looks super clean today! AI co-host voice is fire!',
    timestamp: '09:42:30',
    sentiment: 'positive',
  },
  {
    id: 'm-5',
    platform: 'twitch',
    username: 'TrollBot_3000',
    userColor: '#eab308',
    message: 'You aim like an NPC LUL LUL',
    timestamp: '09:42:35',
    sentiment: 'toxic',
  },
];

export const MultiChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [pinnedMsg, setPinnedMsg] = useState<ChatMessage | null>(MOCK_MESSAGES[0]);

  // Viewer Action Modal state
  const [activeUserModal, setActiveUserModal] = useState<{
    msg: ChatMessage;
    generatedRoast?: string;
    isGeneratingRoast?: boolean;
    statusNotice?: string;
  } | null>(null);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      platform: 'system',
      username: 'Streamer (GhostOS)',
      userColor: '#38bdf8',
      badges: ['broadcaster'],
      message: inputMsg,
      timestamp: new Date().toLocaleTimeString(),
      sentiment: 'positive',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  const postSystemMessage = (text: string) => {
    const sysMsg: ChatMessage = {
      id: `sys_${Date.now()}`,
      platform: 'system',
      username: 'GhostOS_Bot',
      userColor: '#ec4899',
      badges: ['bot'],
      message: text,
      timestamp: new Date().toLocaleTimeString(),
      sentiment: 'hype',
    };
    setMessages((prev) => [...prev, sysMsg]);
    EventBus.emit('ChatMessage', 'MultiChatView', sysMsg);
  };

  const handleSuggestAiReply = async () => {
    setIsAiLoading(true);
    const lastUserMsg = messages[messages.length - 1];
    const suggestion = await AIEngine.generateResponse(
      `Suggest a quick chat reply to: "${lastUserMsg?.message || 'Hello stream'}"`
    );
    setInputMsg(suggestion.replace(/\[.*?\]:/, '').trim());
    setIsAiLoading(false);
  };

  // User Actions
  const handleOpenUserModal = (msg: ChatMessage) => {
    setActiveUserModal({ msg });
  };

  const handleGenerateRoastForUser = async () => {
    if (!activeUserModal) return;
    setActiveUserModal((prev) => (prev ? { ...prev, isGeneratingRoast: true } : null));
    const roast = await AIEngine.generateRoast(activeUserModal.msg.username);
    setActiveUserModal((prev) =>
      prev
        ? {
            ...prev,
            generatedRoast: roast,
            isGeneratingRoast: false,
          }
        : null
    );
  };

  const handleSendRoastFromModal = () => {
    if (!activeUserModal || !activeUserModal.generatedRoast) return;
    postSystemMessage(`🔥 @${activeUserModal.msg.username}: ${activeUserModal.generatedRoast}`);
    setActiveUserModal((prev) =>
      prev ? { ...prev, statusNotice: '✅ Roast sent into Live Chat!' } : null
    );
    setTimeout(() => {
      setActiveUserModal((prev) => (prev ? { ...prev, statusNotice: undefined } : null));
    }, 2500);
  };

  const handleReadRoastAloud = () => {
    if (!activeUserModal?.generatedRoast) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeUserModal.generatedRoast);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShoutoutUser = () => {
    if (!activeUserModal) return;
    const shoutoutText = `📢 SHOUTOUT to @${activeUserModal.msg.username}! Thank you for supporting the stream! Go drop them a follow! 🎉`;
    postSystemMessage(shoutoutText);
    setActiveUserModal((prev) =>
      prev ? { ...prev, statusNotice: `📢 Sent Shoutout for @${activeUserModal.msg.username}!` } : null
    );
    setTimeout(() => {
      setActiveUserModal((prev) => (prev ? { ...prev, statusNotice: undefined } : null));
    }, 2500);
  };

  const handleGiftCoins = () => {
    if (!activeUserModal) return;
    EconomyEngine.addViewerPoints(activeUserModal.msg.username, 500);
    postSystemMessage(`🪙 Streamer gifted 500 Stream Coins to @${activeUserModal.msg.username}!`);
    setActiveUserModal((prev) =>
      prev ? { ...prev, statusNotice: `🪙 Gifted 500 Coins to @${activeUserModal.msg.username}!` } : null
    );
    setTimeout(() => {
      setActiveUserModal((prev) => (prev ? { ...prev, statusNotice: undefined } : null));
    }, 2500);
  };

  const handleToggleVIP = () => {
    if (!activeUserModal) return;
    const targetUsername = activeUserModal.msg.username;
    setMessages((prev) =>
      prev.map((m) =>
        m.username === targetUsername
          ? {
              ...m,
              isVIP: !m.isVIP,
              badges: m.isVIP
                ? (m.badges || []).filter((b) => b !== 'vip')
                : [...(m.badges || []), 'vip'],
            }
          : m
      )
    );
    setActiveUserModal((prev) =>
      prev ? { ...prev, statusNotice: `⭐ Toggled VIP status for @${targetUsername}` } : null
    );
    setTimeout(() => {
      setActiveUserModal((prev) => (prev ? { ...prev, statusNotice: undefined } : null));
    }, 2500);
  };

  const handleTimeoutUser = () => {
    if (!activeUserModal) return;
    const targetUsername = activeUserModal.msg.username;
    postSystemMessage(`⏱️ @${targetUsername} has been timed out for 60 seconds.`);
    setActiveUserModal((prev) =>
      prev ? { ...prev, statusNotice: `⏱️ Timed out @${targetUsername} for 60s` } : null
    );
    setTimeout(() => {
      setActiveUserModal((prev) => (prev ? { ...prev, statusNotice: undefined } : null));
    }, 2500);
  };

  const filteredMessages = messages.filter(
    (m) => selectedPlatform === 'all' || m.platform === selectedPlatform
  );

  const platformBadgeColor = (p: Platform) => {
    switch (p) {
      case 'twitch':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'kick':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'youtube':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'discord':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Unified Multi-Chat & Transparent Overlay
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregates Twitch, Kick, YouTube, and Discord into a single responsive feed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOverlayMode(!isOverlayMode)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border shadow-sm ${
              isOverlayMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            {isOverlayMode ? 'Exit HUD Transparent Mode' : 'Single-Monitor Transparent HUD'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`rounded-2xl border transition-all ${
          isOverlayMode
            ? 'bg-slate-950/40 backdrop-blur-md border-cyan-500/40 p-4 shadow-2xl shadow-cyan-500/10'
            : 'bg-slate-900 border-slate-800 p-5 shadow-xl'
        }`}
      >
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800/80 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Platforms:</span>
            {(['all', 'twitch', 'kick', 'youtube', 'discord'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  selectedPlatform === p
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === 'all' ? (
                  <span>ALL CHATS</span>
                ) : (
                  <PlatformLogo platform={p} size="sm" showLabel />
                )}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {filteredMessages.length} Messages Active
          </div>
        </div>

        {/* Pinned Message Banner */}
        {pinnedMsg && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <PlatformLogo platform={pinnedMsg.platform} size="sm" />
              <span className="font-bold text-amber-300">{pinnedMsg.username}:</span>
              <span className="text-slate-200">{pinnedMsg.message}</span>
            </div>
            <button
              onClick={() => setPinnedMsg(null)}
              className="text-[10px] text-slate-400 hover:text-slate-200 underline"
            >
              Unpin
            </button>
          </div>
        )}

        {/* Chat Stream Window */}
        <div className="h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                msg.sentiment === 'toxic'
                  ? 'bg-rose-500/10 border-rose-500/20'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <PlatformLogo platform={msg.platform} size="sm" showLabel />

                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenUserModal(msg)}
                      className="font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
                      style={{ color: msg.userColor || '#38bdf8' }}
                      title="Click for Viewer Actions (Roast, Shoutout, Coins, VIP)"
                    >
                      {msg.username}
                    </button>
                    {msg.badges?.map((b) => (
                      <span
                        key={b}
                        className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono"
                      >
                        {b}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1">{msg.message}</p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={() => handleOpenUserModal(msg)}
                  className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-[10px] font-bold flex items-center gap-1 border border-indigo-500/30"
                  title="Viewer Context Actions"
                >
                  <UserCheck className="w-3 h-3 text-indigo-400" /> Actions
                </button>
                <button
                  onClick={() => setPinnedMsg(msg)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Pin Message"
                >
                  <Pin className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Composer & AI Assistant Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSuggestAiReply}
              disabled={isAiLoading}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAiLoading ? 'Gemini Thinking...' : 'AI Suggest Reply'}
            </button>
            <span className="text-[11px] text-slate-500">
              Broadcasting simultaneously to Twitch, Kick, YouTube, Discord.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Send message to multi-chat..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      </div>

      {/* Viewer Actions Modal */}
      {activeUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 relative">
            <button
              onClick={() => setActiveUserModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shadow-md"
                style={{ backgroundColor: activeUserModal.msg.userColor || '#38bdf8' }}
              >
                {activeUserModal.msg.username.substring(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  @{activeUserModal.msg.username}
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                    {activeUserModal.msg.platform}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono italic">
                  "{activeUserModal.msg.message}"
                </p>
              </div>
            </div>

            {activeUserModal.statusNotice && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {activeUserModal.statusNotice}
              </div>
            )}

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleGenerateRoastForUser}
                disabled={activeUserModal.isGeneratingRoast}
                className="p-3 rounded-xl bg-gradient-to-r from-rose-600/30 to-orange-600/30 border border-rose-500/40 hover:border-rose-400 text-rose-200 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>{activeUserModal.isGeneratingRoast ? 'Generating...' : '🔥 Roast User'}</span>
              </button>

              <button
                onClick={handleShoutoutUser}
                className="p-3 rounded-xl bg-indigo-600/30 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <Megaphone className="w-4 h-4 text-indigo-400" />
                <span>📢 Send Shoutout</span>
              </button>

              <button
                onClick={handleGiftCoins}
                className="p-3 rounded-xl bg-amber-600/30 border border-amber-500/40 hover:border-amber-400 text-amber-200 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>🪙 Gift 500 Coins</span>
              </button>

              <button
                onClick={handleToggleVIP}
                className="p-3 rounded-xl bg-purple-600/30 border border-purple-500/40 hover:border-purple-400 text-purple-200 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <Award className="w-4 h-4 text-purple-400" />
                <span>⭐ Toggle VIP Status</span>
              </button>

              <button
                onClick={handleTimeoutUser}
                className="p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-slate-300 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>⏱️ Timeout 60s</span>
              </button>

              <button
                onClick={() => {
                  setPinnedMsg(activeUserModal.msg);
                  setActiveUserModal((prev) =>
                    prev ? { ...prev, statusNotice: '📌 Message Pinned to Top!' } : null
                  );
                }}
                className="p-3 rounded-xl bg-cyan-600/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <Pin className="w-4 h-4 text-cyan-400" />
                <span>📌 Pin Message</span>
              </button>
            </div>

            {/* Generated Roast Output Box */}
            {activeUserModal.generatedRoast && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> AI Generated Roast Output:
                  </span>
                </div>
                <p className="text-xs text-rose-200 font-medium italic">
                  "{activeUserModal.generatedRoast}"
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleSendRoastFromModal}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Send to Chat
                  </button>
                  <button
                    onClick={handleReadRoastAloud}
                    className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
