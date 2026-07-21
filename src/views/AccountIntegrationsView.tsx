import React, { useState } from 'react';
import {
  Radio,
  CheckCircle,
  XCircle,
  Link2,
  RefreshCw,
  Video,
  Key,
  Shield,
  Bot,
  MessageSquare,
  Sparkles,
  Save,
  User,
  Globe,
  Share2,
  Youtube,
  Twitch,
  Twitter,
  Instagram,
  MessageCircle,
} from 'lucide-react';
import { StorageService } from '../core/StorageService';
import { LinkedAccounts, CreatorProfile } from '../types';
import { TwitchChannelPointsManager } from '../components/TwitchChannelPointsManager';
import { DiscordWebhookManager } from '../components/DiscordWebhookManager';

export const AccountIntegrationsView: React.FC = () => {
  const [accounts, setAccounts] = useState<LinkedAccounts>(StorageService.getAccounts());
  const [creator, setCreator] = useState<CreatorProfile>(StorageService.getCreatorProfile());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSaveCreator = () => {
    StorageService.saveCreatorProfile(creator);
    setStatusMsg(`✅ Saved Creator Profile & Social Links for ${creator.authorName}!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Auto-save helper that updates state AND persists immediately to localStorage / StorageService
  const updatePlatform = <K extends keyof LinkedAccounts>(
    platform: K,
    updates: Partial<LinkedAccounts[K]>
  ) => {
    setAccounts((prev) => {
      const next = {
        ...prev,
        [platform]: {
          ...prev[platform],
          ...updates,
        },
      };
      StorageService.saveAccounts(next);
      return next;
    });
    setStatusMsg('✅ Auto-saved changes');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleManualSave = (platformName?: string) => {
    StorageService.saveAccounts(accounts);
    setStatusMsg(
      platformName
        ? `✅ Saved & persistent synced ${platformName} credentials!`
        : '✅ Stream platform accounts and credentials saved & synced successfully!'
    );
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const toggleConnection = (platform: keyof LinkedAccounts) => {
    updatePlatform(platform, {
      connected: !accounts[platform].connected,
    } as any);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            Stream Platforms & Account Integrations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Link Twitch, Kick, YouTube, Discord, and OBS Studio credentials. All changes auto-save instantly.
          </p>
        </div>

        <button
          onClick={() => handleManualSave()}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 shrink-0"
        >
          <Save className="w-4 h-4" /> Save & Sync All Integrations
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

      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Twitch Card */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-sm">
                  TW
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Twitch Integration</h3>
                  <p className="text-xs text-slate-400">Chat, Sub Alerts & Channel Points</p>
                </div>
              </div>

              <button
                onClick={() => toggleConnection('twitch')}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  accounts.twitch.connected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {accounts.twitch.connected ? 'LINKED' : 'OFFLINE'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Twitch Channel Username</label>
                <input
                  type="text"
                  value={accounts.twitch.username}
                  onChange={(e) => updatePlatform('twitch', { username: e.target.value })}
                  onBlur={() => handleManualSave('Twitch')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">OAuth Token / Client ID</label>
                <input
                  type="password"
                  value={accounts.twitch.accessToken || ''}
                  onChange={(e) => updatePlatform('twitch', { accessToken: e.target.value })}
                  onBlur={() => handleManualSave('Twitch')}
                  placeholder="oauth:xxxxxxxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300">Enable AI Chat Bot & Auto Reply</span>
                <input
                  type="checkbox"
                  checked={accounts.twitch.botEnabled}
                  onChange={(e) => updatePlatform('twitch', { botEnabled: e.target.checked })}
                  className="accent-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleManualSave('Twitch')}
            className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <Save className="w-3.5 h-3.5 text-purple-400" /> Save Twitch Settings
          </button>
        </div>

        {/* Kick Card */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  KC
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Kick Streaming</h3>
                  <p className="text-xs text-slate-400">Green Room Chat & Sub Goals</p>
                </div>
              </div>

              <button
                onClick={() => toggleConnection('kick')}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  accounts.kick.connected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {accounts.kick.connected ? 'LINKED' : 'OFFLINE'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Kick Channel Name</label>
                <input
                  type="text"
                  value={accounts.kick.username}
                  onChange={(e) => updatePlatform('kick', { username: e.target.value })}
                  onBlur={() => handleManualSave('Kick')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Kick API Key</label>
                <input
                  type="password"
                  value={accounts.kick.apiKey || ''}
                  onChange={(e) => updatePlatform('kick', { apiKey: e.target.value })}
                  onBlur={() => handleManualSave('Kick')}
                  placeholder="kick_key_xxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300">Enable Kick Bot Reactions</span>
                <input
                  type="checkbox"
                  checked={accounts.kick.botEnabled}
                  onChange={(e) => updatePlatform('kick', { botEnabled: e.target.checked })}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleManualSave('Kick')}
            className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" /> Save Kick Settings
          </button>
        </div>

        {/* YouTube Card */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-sm">
                  YT
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">YouTube Live</h3>
                  <p className="text-xs text-slate-400">Live Chat & Stream Key Sync</p>
                </div>
              </div>

              <button
                onClick={() => toggleConnection('youtube')}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  accounts.youtube.connected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {accounts.youtube.connected ? 'LINKED' : 'OFFLINE'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">YouTube Channel Name</label>
                <input
                  type="text"
                  value={accounts.youtube.channelName}
                  onChange={(e) => updatePlatform('youtube', { channelName: e.target.value })}
                  onBlur={() => handleManualSave('YouTube')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">RTMP Stream Key</label>
                <input
                  type="password"
                  value={accounts.youtube.streamKey || ''}
                  onChange={(e) => updatePlatform('youtube', { streamKey: e.target.value })}
                  onBlur={() => handleManualSave('YouTube')}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleManualSave('YouTube')}
            className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <Save className="w-3.5 h-3.5 text-red-400" /> Save YouTube Settings
          </button>
        </div>

        {/* Discord Card */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  DC
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Discord Webhook & Bot</h3>
                  <p className="text-xs text-slate-400">Stream Going Live Announcements</p>
                </div>
              </div>

              <button
                onClick={() => toggleConnection('discord')}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  accounts.discord.connected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {accounts.discord.connected ? 'LINKED' : 'OFFLINE'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Discord Webhook URL</label>
                <input
                  type="text"
                  value={accounts.discord.webhookUrl}
                  onChange={(e) => updatePlatform('discord', { webhookUrl: e.target.value })}
                  onBlur={() => handleManualSave('Discord')}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300">Auto-post Live Announcement on Discord</span>
                <input
                  type="checkbox"
                  checked={accounts.discord.broadcastStreamStatus}
                  onChange={(e) =>
                    updatePlatform('discord', { broadcastStreamStatus: e.target.checked })
                  }
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleManualSave('Discord')}
            className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" /> Save Discord Settings
          </button>
        </div>
      </div>

      {/* Twitch Channel Points Redemptions Section */}
      <TwitchChannelPointsManager />

      {/* Discord Bot & Webhook Server Alerts Section */}
      <DiscordWebhookManager />

      {/* Creator Branding & Social Media Profile Settings */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Creator Profile & Social Links
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  Built by {creator.authorName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Customize your developer credit name and social links displayed across GhostOS.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveCreator}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 shrink-0"
          >
            <Save className="w-4 h-4" /> Save Creator Branding
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Developer / Author Name</label>
            <input
              type="text"
              value={creator.authorName}
              onChange={(e) => setCreator({ ...creator, authorName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. TJ SINGH"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tagline / Title</label>
            <input
              type="text"
              value={creator.tagline}
              onChange={(e) => setCreator({ ...creator, tagline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. Streamer, Developer & AI Specialist"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube Channel Link
            </label>
            <input
              type="url"
              value={creator.youtubeUrl}
              onChange={(e) => setCreator({ ...creator, youtubeUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="https://youtube.com/@TJSINGH"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Twitch className="w-3.5 h-3.5 text-purple-400" /> Twitch Channel Link
            </label>
            <input
              type="url"
              value={creator.twitchUrl}
              onChange={(e) => setCreator({ ...creator, twitchUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="https://twitch.tv/TJSINGH"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Twitter className="w-3.5 h-3.5 text-sky-400" /> Twitter / X Link
            </label>
            <input
              type="url"
              value={creator.twitterUrl}
              onChange={(e) => setCreator({ ...creator, twitterUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="https://x.com/TJSINGH"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram Link
            </label>
            <input
              type="url"
              value={creator.instagramUrl}
              onChange={(e) => setCreator({ ...creator, instagramUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="https://instagram.com/TJSINGH"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-indigo-400" /> Discord Invite Link
            </label>
            <input
              type="url"
              value={creator.discordUrl}
              onChange={(e) => setCreator({ ...creator, discordUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="https://discord.gg/TJSINGH"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Portfolio Website Link
            </label>
            <input
              type="url"
              value={creator.portfolioUrl}
              onChange={(e) => setCreator({ ...creator, portfolioUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="https://tjsingh.com"
            />
          </div>
        </div>

        {/* Live Active Preview Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-bold">Active Social Media Buttons Preview:</span>
          <div className="flex items-center gap-2">
            {creator.youtubeUrl && (
              <a href={creator.youtubeUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30" title="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {creator.twitchUrl && (
              <a href={creator.twitchUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30" title="Twitch">
                <Twitch className="w-4 h-4" />
              </a>
            )}
            {creator.twitterUrl && (
              <a href={creator.twitterUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-sky-600/20 text-sky-400 hover:bg-sky-600/30" title="Twitter / X">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {creator.instagramUrl && (
              <a href={creator.instagramUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-pink-600/20 text-pink-400 hover:bg-pink-600/30" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {creator.discordUrl && (
              <a href={creator.discordUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30" title="Discord">
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {creator.portfolioUrl && (
              <a href={creator.portfolioUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30" title="Portfolio">
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

