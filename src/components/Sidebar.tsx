import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Camera,
  MessageSquare,
  Video,
  Bot,
  Grid,
  Disc,
  Coins,
  GitFork,
  ShoppingBag,
  Smartphone,
  Terminal,
  Link2,
  Monitor,
  Heart,
  Youtube,
  Twitch,
  Twitter,
  Globe,
} from 'lucide-react';
import { StorageService } from '../core/StorageService';
import { EventBus } from '../core/EventBus';

export type WorkspaceView =
  | 'dashboard'
  | 'polaroid'
  | 'analytics'
  | 'chat'
  | 'obs'
  | 'ai'
  | 'deck'
  | 'wheel'
  | 'economy'
  | 'flow'
  | 'marketplace'
  | 'accounts'
  | 'desktop_audio'
  | 'mobile'
  | 'dev';

interface SidebarProps {
  currentView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const [creator, setCreator] = useState(StorageService.getCreatorProfile());

  useEffect(() => {
    const unsub = EventBus.subscribe('CreatorProfileUpdated', (evt) => {
      if (evt.payload?.creator) {
        setCreator(evt.payload.creator);
      }
    });
    return () => unsub();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'polaroid', label: 'GhostOS Polaroid Plugin', icon: Camera },
    { id: 'analytics', label: 'Twitch & Kick Analytics', icon: BarChart3 },
    { id: 'chat', label: 'Multi-Chat & Overlay', icon: MessageSquare },
    { id: 'obs', label: 'OBS Studio Manager', icon: Video },
    { id: 'ai', label: 'AI Co-Host & Director', icon: Bot },
    { id: 'deck', label: 'Stream & Audio Deck', icon: Grid },
    { id: 'wheel', label: 'Wheel Studio & Polls', icon: Disc },
    { id: 'economy', label: 'Stream Economy & GTA RP', icon: Coins },
    { id: 'flow', label: 'Flow Automation Builder', icon: GitFork },
    { id: 'marketplace', label: 'Plugin & Theme Store', icon: ShoppingBag },
    { id: 'accounts', label: 'Linked Stream Accounts', icon: Link2 },
    { id: 'desktop_audio', label: 'Hybrid PC & Audio Settings', icon: Monitor },
    { id: 'mobile', label: 'Mobile Companion', icon: Smartphone },
    { id: 'dev', label: 'Dev Console & Backup', icon: Terminal },
  ];

  return (
    <aside className="w-16 md:w-60 bg-slate-900/90 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between py-3 shrink-0 select-none z-20">
      <div className="space-y-1 px-2">
        <div className="hidden md:block px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Workspaces & Core Plugins
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id as WorkspaceView)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-600/20 text-cyan-400 border border-cyan-500/30 font-semibold shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={item.label}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span className="hidden md:inline truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-3 pt-3 border-t border-slate-800/80 hidden md:block text-[11px] text-slate-400 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-rose-500" />
            Built by {creator.authorName}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">{creator.tagline}</p>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
            {creator.youtubeUrl && (
              <a href={creator.youtubeUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-400 transition-colors" title="YouTube">
                <Youtube className="w-3.5 h-3.5" />
              </a>
            )}
            {creator.twitchUrl && (
              <a href={creator.twitchUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 transition-colors" title="Twitch">
                <Twitch className="w-3.5 h-3.5" />
              </a>
            )}
            {creator.twitterUrl && (
              <a href={creator.twitterUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors" title="Twitter / X">
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {creator.portfolioUrl && (
              <a href={creator.portfolioUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors" title="Portfolio">
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
