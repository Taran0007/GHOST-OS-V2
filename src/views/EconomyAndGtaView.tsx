import React, { useState } from 'react';
import {
  Coins,
  Building,
  Briefcase,
  Gift,
  TrendingUp,
  Award,
  UserCheck,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { EconomyEngine } from '../core/EconomyEngine';
import { ViewerProfile } from '../types';

export const EconomyAndGtaView: React.FC = () => {
  const [viewers, setViewers] = useState<ViewerProfile[]>(EconomyEngine.getViewers());
  const [selectedViewerId, setSelectedViewerId] = useState<string>(viewers[0]?.id || 'v-1');
  const [giveawayPrize, setGiveawayPrize] = useState('10,000 Points + VIP Pass');
  const [giveawayWinner, setGiveawayWinner] = useState<string | null>(null);

  const selectedViewer = viewers.find((v) => v.id === selectedViewerId) || viewers[0];

  const handleCollectRevenue = () => {
    const collected = EconomyEngine.collectDailyRevenue(selectedViewer.id);
    setViewers([...EconomyEngine.getViewers()]);
    alert(`💰 Collected $${collected} daily business revenue for @${selectedViewer.username}!`);
  };

  const handleLaunchGiveaway = () => {
    const winnerObj = viewers[Math.floor(Math.random() * viewers.length)];
    setGiveawayWinner(`🎉 Winner: @${winnerObj.username}! Prize: ${giveawayPrize}`);
    EconomyEngine.addPoints(winnerObj.id, 10000, 'Giveaway Win');
    setViewers([...EconomyEngine.getViewers()]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            Stream Economy & GTA RP Business Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persistent viewer profiles with XP levels, GTA RP businesses, jobs, inventory, and giveaways.
          </p>
        </div>

        <button
          onClick={handleCollectRevenue}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 shrink-0"
        >
          <TrendingUp className="w-4 h-4" /> Collect Daily Business Income
        </button>
      </div>

      {/* Main Grid: Viewer Selector & Profile Details | GTA RP Businesses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Viewers List */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            Viewer Profiles ({viewers.length})
          </h2>

          <div className="space-y-2">
            {viewers.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedViewerId(v.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                  selectedViewer.id === v.id
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-slate-100 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={v.avatar} alt={v.username} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-slate-200">{v.username}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Lvl {v.level} • {v.job}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-amber-400 font-bold">{v.points.toLocaleString()} PTS</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center (2 Spans): Viewer Profile Details & GTA RP Businesses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Viewer Stats Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedViewer.avatar}
                  alt={selectedViewer.username}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40"
                />
                <div>
                  <h2 className="text-base font-bold text-slate-100">{selectedViewer.username}</h2>
                  <p className="text-xs text-slate-400">{selectedViewer.job}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">WATCH TIME</span>
                  <span className="text-cyan-400 font-bold">{selectedViewer.watchTimeHours} Hrs</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">POINTS</span>
                  <span className="text-amber-400 font-bold">{selectedViewer.points.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* GTA RP Owned Businesses */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                Owned RP Businesses ({selectedViewer.businesses.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedViewer.businesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">{biz.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        Lvl {biz.level}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                      <span>Daily Revenue:</span>
                      <span className="text-emerald-400 font-bold">+${biz.dailyIncome}/day</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory & Achievements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Inventory Items:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedViewer.inventory.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Achievements Unlocked:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedViewer.achievements.map((ach, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-amber-500/10 text-[10px] text-amber-300 border border-amber-500/20"
                    >
                      🏆 {ach}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Giveaway Launcher Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-400" />
              Community Giveaway Launcher
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={giveawayPrize}
                onChange={(e) => setGiveawayPrize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleLaunchGiveaway}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
              >
                Draw Winner!
              </button>
            </div>

            {giveawayWinner && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200 font-bold">
                {giveawayWinner}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
