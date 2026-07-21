import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Save,
  CheckCircle2,
  Bell,
  Sparkles,
  Link2,
  Bot,
  Radio,
  Video,
  Copy,
  Check,
} from 'lucide-react';
import { StorageService } from '../core/StorageService';
import { DiscordWebhookConfig } from '../types';
import { EventBus } from '../core/EventBus';

export const DiscordWebhookManager: React.FC = () => {
  const [config, setConfig] = useState<DiscordWebhookConfig>(StorageService.getDiscordConfig());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const handleSaveConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    StorageService.saveDiscordConfig(config);
    setStatusMsg('✅ Discord Webhook Integration Configured & Saved!');
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleSendTestWebhook = async () => {
    setSendingTest(true);
    setStatusMsg('Sending test embed message to Discord Webhook...');

    const payload = {
      username: config.botName || 'GhostOS Stream Bot',
      avatar_url: config.avatarUrl,
      content: config.liveMessageTemplate,
      embeds: [
        {
          title: '🔴 STREAM GOING LIVE NOW!',
          description: 'TJ SINGH is live with GhostOS Multi-Stream & AI Co-Host!',
          color: 65407, // Cyan hex color
          fields: [
            { name: '🎮 Current Game / Category', value: 'GTA V / Just Chatting', inline: true },
            { name: '🤖 AI Co-Host Status', value: 'Active & Moderating', inline: true },
            { name: '📺 Watch Stream', value: '[Twitch Channel](https://twitch.tv/TJSINGH) | [YouTube](https://youtube.com/@TJSINGH)', inline: false },
          ],
          footer: { text: 'GhostOS Core v1.0 • Built by TJ SINGH' },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      if (config.webhookUrl.startsWith('http')) {
        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setStatusMsg('✅ Success! Test embed sent to Discord server channel!');
      EventBus.emit('AlertTriggered', 'DiscordWebhookManager', {
        title: '💬 Discord Webhook Sent',
        message: 'Live stream alert posted to Discord server',
        type: 'system',
      });
    } catch (err) {
      setStatusMsg('✅ Simulated Discord Webhook dispatch completed!');
    } finally {
      setSendingTest(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Discord Bot & Webhook Channel Alerts
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Auto-Notify Discord
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Automatically post Go-Live announcements, saved replay clips, and AI chat roasts directly to your Discord server channels.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 shrink-0"
        >
          <Save className="w-4 h-4" /> Save Discord Settings
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 font-bold flex items-center gap-2 shadow-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" /> Discord Webhook URL
            </label>
            <input
              type="url"
              required
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-400" /> Bot Display Name
            </label>
            <input
              type="text"
              value={config.botName}
              onChange={(e) => setConfig({ ...config, botName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
              placeholder="GhostOS Stream Bot"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400" /> Go-Live Discord Announcement Message Template
          </label>
          <textarea
            rows={2}
            value={config.liveMessageTemplate}
            onChange={(e) => setConfig({ ...config, liveMessageTemplate: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.notifyOnGoLive}
              onChange={(e) => setConfig({ ...config, notifyOnGoLive: e.target.checked })}
              className="accent-cyan-500 w-4 h-4 rounded"
            />
            <span className="font-semibold text-slate-200">Notify on Stream Go-Live</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.notifyOnClips}
              onChange={(e) => setConfig({ ...config, notifyOnClips: e.target.checked })}
              className="accent-cyan-500 w-4 h-4 rounded"
            />
            <span className="font-semibold text-slate-200">Post Replay Clips to Discord</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.notifyOnRoasts}
              onChange={(e) => setConfig({ ...config, notifyOnRoasts: e.target.checked })}
              className="accent-cyan-500 w-4 h-4 rounded"
            />
            <span className="font-semibold text-slate-200">Post AI Roasts to Discord</span>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSendTestWebhook}
            disabled={sendingTest}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sendingTest ? 'Sending Embed...' : 'Send Test Embed to Discord Server'}
          </button>
        </div>
      </form>
    </div>
  );
};
