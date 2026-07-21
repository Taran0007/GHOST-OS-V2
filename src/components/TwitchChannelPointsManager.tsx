import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Trash2,
  Play,
  Sparkles,
  Volume2,
  Tv,
  Flame,
  Disc,
  CheckCircle2,
  Save,
  Zap,
} from 'lucide-react';
import { StorageService } from '../core/StorageService';
import { TwitchReward } from '../types';
import { EventBus } from '../core/EventBus';
import { AIEngine } from '../core/AIEngine';

export const TwitchChannelPointsManager: React.FC = () => {
  const [rewards, setRewards] = useState<TwitchReward[]>(StorageService.getTwitchRewards());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [testUser, setTestUser] = useState('EpicGamer_99');

  // Form for adding custom new Channel Point Reward
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(500);
  const [newPrompt, setNewPrompt] = useState('');
  const [newType, setNewType] = useState<TwitchReward['actionType']>('meme_overlay');
  const [newPayload, setNewPayload] = useState('');

  const handleSaveRewards = (updated: TwitchReward[]) => {
    setRewards(updated);
    StorageService.saveTwitchRewards(updated);
    setStatusMsg('✅ Twitch Channel Points Redemptions auto-saved!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleToggleEnabled = (id: string) => {
    const next = rewards.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    handleSaveRewards(next);
  };

  const handleDeleteReward = (id: string) => {
    const next = rewards.filter((r) => r.id !== id);
    handleSaveRewards(next);
  };

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const reward: TwitchReward = {
      id: `reward_${Date.now()}`,
      title: newTitle.trim(),
      cost: Number(newCost) || 500,
      prompt: newPrompt.trim() || 'Custom Channel Point Reward',
      actionType: newType,
      actionPayload: newPayload.trim() || undefined,
      enabled: true,
      backgroundColor: '#9146FF',
    };

    const next = [...rewards, reward];
    handleSaveRewards(next);

    setNewTitle('');
    setNewCost(500);
    setNewPrompt('');
    setNewPayload('');
  };

  const handleSimulateRedemption = async (reward: TwitchReward) => {
    const username = testUser.trim() || 'StreamViewer';
    setStatusMsg(`🎉 @${username} redeemed [${reward.title}] for ${reward.cost} Channel Points!`);
    setTimeout(() => setStatusMsg(null), 4000);

    // Emit event & perform action
    EventBus.emit('RewardClaimed', 'TwitchChannelPointsManager', {
      user: username,
      reward: reward.title,
      cost: reward.cost,
    });

    if (reward.actionType === 'meme_overlay') {
      EventBus.emit('MemeVideoTriggered', 'TwitchChannelPoints', {
        title: reward.title,
        videoUrl:
          reward.actionPayload ||
          'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWkzaHF4aW1sdGg4azVsNXNydjQyZHc1bXFpdnlmdThic3R4MmcwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPbDhAzsrtdB3unK9v/giphy.gif',
        durationSeconds: 5,
      });
    } else if (reward.actionType === 'audio') {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch {}
      }
    } else if (reward.actionType === 'ai_roast') {
      const roast = await AIEngine.generateRoast(username);
      EventBus.emit('ChatMessage', 'TwitchChannelPoints', {
        id: Date.now().toString(),
        platform: 'twitch',
        username: '🤖 GhostAI Co-Host',
        message: `🔥 CHANNEL POINTS ROAST for @${username}: ${roast}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else if (reward.actionType === 'wheel_spin') {
      EventBus.emit('WheelFinished', 'TwitchChannelPoints', {
        winner: `Channel Points Prize for @${username}`,
      });
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Twitch Channel Points Redemptions Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                {rewards.filter((r) => r.enabled).length} Active Rewards
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              When viewers redeem channel points, automatically trigger custom meme video overlays, sound effects, AI roasts, or prize wheel spins live on stream!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Test Viewer:</span>
          <input
            type="text"
            value={testUser}
            onChange={(e) => setTestUser(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold w-32 focus:outline-none focus:border-cyan-500"
            placeholder="Username"
          />
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl text-xs text-purple-200 font-bold flex items-center gap-2 shadow-md animate-fade-in">
          <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
          {statusMsg}
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              reward.enabled
                ? 'bg-slate-950/80 border-slate-800 hover:border-purple-500/50 shadow-lg'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                  {reward.actionType === 'meme_overlay' && <Tv className="w-3.5 h-3.5 text-cyan-400" />}
                  {reward.actionType === 'audio' && <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
                  {reward.actionType === 'ai_roast' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                  {reward.actionType === 'wheel_spin' && <Disc className="w-3.5 h-3.5 text-emerald-400" />}
                  {reward.title}
                </span>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                  {reward.cost} pts
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2">{reward.prompt}</p>

              {reward.actionPayload && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-cyan-300 truncate">
                  Payload: {reward.actionPayload}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleSimulateRedemption(reward)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                title="Test-redeem this reward right now"
              >
                <Play className="w-3 h-3" /> Test Redeem
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleEnabled(reward.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    reward.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {reward.enabled ? 'Enabled' : 'Disabled'}
                </button>

                <button
                  onClick={() => handleDeleteReward(reward.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Reward"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Reward Form */}
      <form onSubmit={handleAddReward} className="pt-4 border-t border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-cyan-400" /> Create Custom Twitch Channel Point Reward
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Reward Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
              placeholder="e.g. 🐶 Cute Dog Meme"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Points Cost</label>
            <input
              type="number"
              required
              min={100}
              value={newCost}
              onChange={(e) => setNewCost(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Trigger Action Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="meme_overlay">🎬 Video / Meme Overlay</option>
              <option value="audio">🔊 Sound Effect</option>
              <option value="ai_roast">🤖 AI Co-Host Roast</option>
              <option value="wheel_spin">🎡 Prize Wheel Spin</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Action Payload (URL / Sound)</label>
            <input
              type="text"
              value={newPayload}
              onChange={(e) => setNewPayload(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              placeholder="https://...gif or Sound Name"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Save Channel Point Reward
          </button>
        </div>
      </form>
    </div>
  );
};
