import React, { useState } from 'react';
import { Search, Sparkles, Video, Disc, Volume2, Bot, Terminal, X, BarChart3, Camera } from 'lucide-react';
import { PolaroidEngine } from '../core/PolaroidEngine';
import { OBSService } from '../core/OBSService';
import { AIEngine } from '../core/AIEngine';
import { WorkspaceView } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: WorkspaceView) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const commands = [
    {
      id: 'cmd-polaroid-plugin',
      title: '📸 Open GhostOS Polaroid Plugin Studio',
      category: 'Plugin',
      icon: Camera,
      action: () => {
        onNavigate('polaroid');
        onClose();
      },
    },
    {
      id: 'cmd-polaroid-snap',
      title: '📸 Snap Instant Stream Polaroid',
      category: 'Plugin Action',
      icon: Camera,
      action: () => {
        PolaroidEngine.addRequest({ username: 'StreamerHost', platform: 'twitch', triggerSource: 'dashboard' });
        onClose();
      },
    },
    {
      id: 'cmd-analytics',
      title: '📊 View Twitch, Kick & YouTube Stream Analytics',
      category: 'Analytics',
      icon: BarChart3,
      action: () => {
        onNavigate('analytics');
        onClose();
      },
    },
    {
      id: 'cmd-roast',
      title: '🔥 Generate AI Roast for @chat',
      category: 'AI Action',
      icon: Sparkles,
      action: async () => {
        const roast = await AIEngine.generateRoast('ChatUser');
        alert(`GhostOS AI Roast:\n${roast}`);
        onClose();
      },
    },
    {
      id: 'cmd-gaming',
      title: '🎮 Switch Scene to Gaming Main',
      category: 'OBS',
      icon: Video,
      action: () => {
        OBSService.switchScene('🎮 Gaming Main');
        onNavigate('obs');
        onClose();
      },
    },
    {
      id: 'cmd-chatting',
      title: '💬 Switch Scene to Just Chatting',
      category: 'OBS',
      icon: Video,
      action: () => {
        OBSService.switchScene('💬 Just Chatting & AI');
        onNavigate('obs');
        onClose();
      },
    },
    {
      id: 'cmd-spin',
      title: '🎡 Spin Prize Wheel',
      category: 'Wheel',
      icon: Disc,
      action: () => {
        onNavigate('wheel');
        onClose();
      },
    },
    {
      id: 'cmd-sound',
      title: '🔊 Open Soundboard / Audio Deck',
      category: 'Audio',
      icon: Volume2,
      action: () => {
        onNavigate('deck');
        onClose();
      },
    },
    {
      id: 'cmd-flow',
      title: '⚡ Open Visual Flow Builder',
      category: 'Automation',
      icon: Terminal,
      action: () => {
        onNavigate('flow');
        onClose();
      },
    },
    {
      id: 'cmd-dev',
      title: '🛠️ Inspect System Specification Docs',
      category: 'Developer',
      icon: Bot,
      action: () => {
        onNavigate('dev');
        onClose();
      },
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) || cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search GhostOS features..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 focus:outline-none placeholder-slate-500"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No matching GhostOS commands found.</div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                    <span>{cmd.title}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
