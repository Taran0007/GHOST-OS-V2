import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Clock,
  DollarSign,
  Tv,
  Calendar,
  Sparkles,
  Zap,
  Flame,
  Award,
  Download,
  Filter,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Play,
  RotateCcw,
} from 'lucide-react';
import { PlatformLogo } from '../components/PlatformLogo';
import { EventBus } from '../core/EventBus';

interface HistoricalStream {
  id: string;
  title: string;
  category: string;
  date: string;
  duration: string;
  peakViewers: number;
  avgViewers: number;
  totalChatMessages: number;
  subsGained: number;
  revenueEstimate: number;
  platforms: ('twitch' | 'kick' | 'youtube')[];
  topChatter: string;
}

const HISTORICAL_STREAMS: HistoricalStream[] = [
  {
    id: 's-101',
    title: '🎮 GTA RP Heist Night & AI Co-Host Roast Session #14',
    category: 'Grand Theft Auto V',
    date: 'Yesterday, 20:00',
    duration: '05h 24m',
    peakViewers: 8420,
    avgViewers: 5120,
    totalChatMessages: 28400,
    subsGained: 142,
    revenueEstimate: 612.50,
    platforms: ['twitch', 'kick', 'youtube'],
    topChatter: 'GhostRider99',
  },
  {
    id: 's-102',
    title: '🎡 24-Hour Subathon Day 1 w/ Soundboard & Wheel Spins',
    category: 'Just Chatting',
    date: '3 Days Ago',
    duration: '12h 00m',
    peakViewers: 12900,
    avgViewers: 8450,
    totalChatMessages: 68400,
    subsGained: 480,
    revenueEstimate: 1840.00,
    platforms: ['twitch', 'kick', 'youtube'],
    topChatter: 'CyberNinja_X',
  },
  {
    id: 's-103',
    title: '🤖 Testing AI Co-Host Live Voice & Flow Automations',
    category: 'Software & Tech',
    date: '5 Days Ago',
    duration: '04h 15m',
    peakViewers: 4320,
    avgViewers: 2890,
    totalChatMessages: 14200,
    subsGained: 64,
    revenueEstimate: 285.00,
    platforms: ['twitch', 'kick'],
    topChatter: 'PixelQueen',
  },
  {
    id: 's-104',
    title: '🔥 Competitive FPS Ranked Grinding & Viewer Matches',
    category: 'FPS Gaming',
    date: '1 Week Ago',
    duration: '06h 40m',
    peakViewers: 6100,
    avgViewers: 3950,
    totalChatMessages: 21800,
    subsGained: 98,
    revenueEstimate: 410.00,
    platforms: ['twitch', 'kick', 'youtube'],
    topChatter: 'ViperGamer_99',
  },
];

export const StreamAnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'compare'>('live');

  // Real-time Live Stats state with subtle randomized tick updates for immersion
  const [liveStats, setLiveStats] = useState({
    totalViewers: 4460,
    twitchViewers: 1820,
    kickViewers: 1240,
    youtubeViewers: 1400,
    chatVelocity: 244, // msgs/min
    peakToday: 6850,
    subsToday: 89,
    revenueToday: 382.50,
    uptimeSeconds: 13338, // 3h 42m 18s
  });

  const [selectedHistoricalStream, setSelectedHistoricalStream] = useState<HistoricalStream | null>(
    HISTORICAL_STREAMS[0]
  );

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Periodic subtle live viewer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveStats((prev) => {
        const deltaT = Math.floor(Math.random() * 11) - 5;
        const deltaK = Math.floor(Math.random() * 9) - 4;
        const deltaY = Math.floor(Math.random() * 11) - 5;
        const nT = Math.max(1000, prev.twitchViewers + deltaT);
        const nK = Math.max(800, prev.kickViewers + deltaK);
        const nY = Math.max(900, prev.youtubeViewers + deltaY);
        const total = nT + nK + nY;
        return {
          ...prev,
          twitchViewers: nT,
          kickViewers: nK,
          youtubeViewers: nY,
          totalViewers: total,
          peakToday: Math.max(prev.peakToday, total),
          chatVelocity: Math.max(120, prev.chatVelocity + Math.floor(Math.random() * 7) - 3),
          uptimeSeconds: prev.uptimeSeconds + 1,
        };
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s
      .toString()
      .padStart(2, '0')}s`;
  };

  const handleExportReport = () => {
    setExportNotice('📊 Generating High-Res CSV / PDF Analytics Report...');
    setTimeout(() => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(liveStats, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `GhostOS_Stream_Analytics_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setExportNotice('✅ Report Downloaded successfully!');
      setTimeout(() => setExportNotice(null), 3000);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Twitch & Kick Stream Analytics Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live multi-platform viewer metrics, previous stream archive data, chat engagement rate & revenue logs.
          </p>
        </div>

        {/* Tab Selector & Export */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'live'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔴 Live Stream Metrics
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📜 Previous Streams
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'compare'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚖️ Platform Breakdown
            </button>
          </div>

          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export Data
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 font-bold flex items-center gap-2 animate-fade-in shadow-md">
          <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
          {exportNotice}
        </div>
      )}

      {/* TAB 1: LIVE STREAM METRICS */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Concurrent Viewers */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Live Concurrent Viewers</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-100 font-mono flex items-baseline gap-2">
                {liveStats.totalViewers.toLocaleString()}
                <span className="text-xs text-emerald-400 font-normal flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Peak Today: {liveStats.peakToday.toLocaleString()} Viewers
              </p>
            </div>

            {/* Chat Velocity Rate */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Chat Engagement Speed</span>
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-slate-100 font-mono flex items-baseline gap-2">
                {liveStats.chatVelocity}
                <span className="text-xs text-indigo-400 font-normal">msgs/min</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Ultra-High Chat Engagement
              </p>
            </div>

            {/* New Subs & VIPs Today */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">New Subs & Supporters</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-slate-100 font-mono flex items-baseline gap-2">
                +{liveStats.subsToday}
                <span className="text-xs text-amber-400 font-normal">subscribers</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                +18 VIP Channel Redemptions
              </p>
            </div>

            {/* Stream Uptime & Estimated Earnings */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Est. Stream Earnings</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono flex items-baseline gap-2">
                ${liveStats.revenueToday.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Uptime: {formatUptime(liveStats.uptimeSeconds)}
              </p>
            </div>
          </div>

          {/* Platform Live Multi-Stream Breakdown Cards */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" /> Live Stream Platform Viewers Comparison
              </span>
              <span className="text-xs font-mono text-slate-400">
                Broadcasting to 3 Destinations
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Twitch Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <PlatformLogo platform="twitch" size="md" showLabel />
                  <span className="text-xs font-bold font-mono text-purple-300">
                    {Math.round((liveStats.twitchViewers / liveStats.totalViewers) * 100)}% Share
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-100 font-mono">
                  {liveStats.twitchViewers.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Viewers</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(liveStats.twitchViewers / liveStats.totalViewers) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 text-[10px] text-slate-400 font-mono pt-1">
                  <div>Bitrate: 6,200 kbps</div>
                  <div>Chat: 84 msgs/min</div>
                  <div>Resolution: 1080p60</div>
                  <div>FPS: 60.0 FPS</div>
                </div>
              </div>

              {/* Kick Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <PlatformLogo platform="kick" size="md" showLabel />
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {Math.round((liveStats.kickViewers / liveStats.totalViewers) * 100)}% Share
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-100 font-mono">
                  {liveStats.kickViewers.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Viewers</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#53FC18] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(liveStats.kickViewers / liveStats.totalViewers) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 text-[10px] text-slate-400 font-mono pt-1">
                  <div>Bitrate: 7,800 kbps</div>
                  <div>Chat: 62 msgs/min</div>
                  <div>Resolution: 1080p60</div>
                  <div>FPS: 60.0 FPS</div>
                </div>
              </div>

              {/* YouTube Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <PlatformLogo platform="youtube" size="md" showLabel />
                  <span className="text-xs font-bold font-mono text-red-400">
                    {Math.round((liveStats.youtubeViewers / liveStats.totalViewers) * 100)}% Share
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-100 font-mono">
                  {liveStats.youtubeViewers.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Viewers</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(liveStats.youtubeViewers / liveStats.totalViewers) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 text-[10px] text-slate-400 font-mono pt-1">
                  <div>Bitrate: 9,500 kbps</div>
                  <div>Chat: 98 msgs/min</div>
                  <div>Resolution: 1440p60</div>
                  <div>FPS: 60.0 FPS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Concurrent Viewer Timeline Graph Simulation */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Concurrent Viewers Graph (Last 4 Hours)
              </h2>
              <span className="text-xs text-slate-400 font-mono">Updated 2s ago</span>
            </div>

            {/* Custom SVG Sparkline Graph */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-end h-52 relative overflow-hidden">
              <div className="absolute top-3 left-4 text-[10px] text-slate-500 font-mono flex items-center gap-4">
                <span>Peak: {liveStats.peakToday.toLocaleString()} Viewers</span>
                <span>Avg: {Math.round(liveStats.totalViewers * 0.85).toLocaleString()} Viewers</span>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="border-b border-slate-400 w-full" />
                <div className="border-b border-slate-400 w-full" />
                <div className="border-b border-slate-400 w-full" />
              </div>

              {/* SVG Area Chart */}
              <svg className="w-full h-36 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="viewersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M 0 100 Q 50 80, 100 65 T 200 40 T 300 55 T 400 25 T 500 35 L 500 120 L 0 120 Z"
                  fill="url(#viewersGrad)"
                />
                <path
                  d="M 0 100 Q 50 80, 100 65 T 200 40 T 300 55 T 400 25 T 500 35"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                />
              </svg>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-900">
                <span>12:00 PM</span>
                <span>01:00 PM</span>
                <span>02:00 PM</span>
                <span>03:00 PM</span>
                <span>NOW (03:42 PM)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PREVIOUS STREAMS HISTORY */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Streams Archive List */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" /> Stream Sessions Log
              </span>
              <span className="text-xs text-slate-400 font-mono">{HISTORICAL_STREAMS.length} Sessions</span>
            </h2>

            <div className="space-y-3">
              {HISTORICAL_STREAMS.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedHistoricalStream(s)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    selectedHistoricalStream?.id === s.id
                      ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{s.date}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 font-bold">{s.duration}</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{s.title}</h3>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400 font-mono">
                      Peak: <strong className="text-slate-200">{s.peakViewers.toLocaleString()}</strong>
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      ${s.revenueEstimate.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Stream Details Inspector */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            {selectedHistoricalStream ? (
              <>
                <div className="border-b border-slate-800 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-bold">
                      {selectedHistoricalStream.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Broadcasting Date: {selectedHistoricalStream.date}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-100">
                    {selectedHistoricalStream.title}
                  </h2>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Peak Viewers</span>
                    <div className="text-lg font-bold font-mono text-cyan-400">
                      {selectedHistoricalStream.peakViewers.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Viewers</span>
                    <div className="text-lg font-bold font-mono text-indigo-400">
                      {selectedHistoricalStream.avgViewers.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Chat Msgs</span>
                    <div className="text-lg font-bold font-mono text-amber-400">
                      {selectedHistoricalStream.totalChatMessages.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Earned Revenue</span>
                    <div className="text-lg font-bold font-mono text-emerald-400">
                      ${selectedHistoricalStream.revenueEstimate.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Platform Badges & Top Chatter */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> Platform Multi-Broadcast Targets
                  </h3>

                  <div className="flex items-center gap-3">
                    {selectedHistoricalStream.platforms.map((p) => (
                      <PlatformLogo key={p} platform={p} size="md" showLabel />
                    ))}
                  </div>

                  <div className="text-xs text-slate-400 border-t border-slate-900 pt-3 flex items-center justify-between">
                    <span>
                      🥇 #1 Top Chatter MVP:{' '}
                      <strong className="text-cyan-300">@{selectedHistoricalStream.topChatter}</strong>
                    </span>
                    <span>Subscribers Gained: +{selectedHistoricalStream.subsGained}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                Select a stream session from the list to view full analytics.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM BREAKDOWN */}
      {activeTab === 'compare' && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Twitch vs Kick vs YouTube Audience Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-950 rounded-2xl border border-purple-500/30 space-y-3">
              <PlatformLogo platform="twitch" size="lg" showLabel />
              <div className="text-xs text-slate-300 space-y-1">
                <div>Average Viewers: <strong>1,820</strong></div>
                <div>Subscribers Rate: <strong>68% of Total</strong></div>
                <div>Top Emote Used: <strong>PogChamp / KEKW</strong></div>
                <div>Chat Velocity: <strong>84 msgs/min</strong></div>
              </div>
            </div>

            <div className="p-5 bg-slate-950 rounded-2xl border border-[#53FC18]/30 space-y-3">
              <PlatformLogo platform="kick" size="lg" showLabel />
              <div className="text-xs text-slate-300 space-y-1">
                <div>Average Viewers: <strong>1,240</strong></div>
                <div>Subscribers Rate: <strong>22% of Total</strong></div>
                <div>Top Emote Used: <strong>W / 🔥</strong></div>
                <div>Chat Velocity: <strong>62 msgs/min</strong></div>
              </div>
            </div>

            <div className="p-5 bg-slate-950 rounded-2xl border border-red-500/30 space-y-3">
              <PlatformLogo platform="youtube" size="lg" showLabel />
              <div className="text-xs text-slate-300 space-y-1">
                <div>Average Viewers: <strong>1,400</strong></div>
                <div>Subscribers Rate: <strong>10% of Total</strong></div>
                <div>Top Emote Used: <strong>Superchat / 😎</strong></div>
                <div>Chat Velocity: <strong>98 msgs/min</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
