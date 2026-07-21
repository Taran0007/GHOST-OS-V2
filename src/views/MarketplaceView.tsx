import React, { useState } from 'react';
import {
  ShoppingBag,
  Download,
  CheckCircle,
  Sparkles,
  Shield,
  Star,
  Palette,
  Layers,
  Search,
} from 'lucide-react';
import { PluginManager } from '../core/PluginManager';
import { ThemeEngine, GHOST_THEMES } from '../core/ThemeEngine';
import { PluginManifest, ThemeId } from '../types';

export const MarketplaceView: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginManifest[]>(PluginManager.getAllPlugins());
  const [activeTab, setActiveTab] = useState<'plugins' | 'themes' | 'overlays'>('plugins');
  const [activeTheme, setActiveTheme] = useState(ThemeEngine.getActiveTheme());
  const [search, setSearch] = useState('');

  const handleTogglePlugin = (id: string, currentStatus: PluginManifest['status']) => {
    if (currentStatus === 'running') {
      PluginManager.setPluginStatus(id, 'stopped');
    } else {
      PluginManager.setPluginStatus(id, 'running');
    }
    setPlugins([...PluginManager.getAllPlugins()]);
  };

  const handleSelectTheme = (id: ThemeId) => {
    ThemeEngine.setTheme(id);
    setActiveTheme(ThemeEngine.getActiveTheme());
  };

  const filteredPlugins = plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            GhostOS Plugin & Theme Store
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse official core modules, community extensions, theme skins, and overlay widget packs.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('plugins')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'plugins'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Plugins ({plugins.length})
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'themes'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Themes ({GHOST_THEMES.length})
          </button>
        </div>
      </div>

      {/* Plugins Tab */}
      {activeTab === 'plugins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter plugins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">
              All plugins run isolated in sandbox runtime
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlugins.map((plugin) => (
              <div
                key={plugin.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100">{plugin.name}</span>
                    <span
                      className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${
                        plugin.category === 'official'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : plugin.category === 'premium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {plugin.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{plugin.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {plugin.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-500 font-mono border border-slate-800"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[10px]">v{plugin.version} • {plugin.author}</span>
                  <button
                    onClick={() => handleTogglePlugin(plugin.id, plugin.status)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      plugin.status === 'running'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {plugin.status === 'running' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Installed
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> Install
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GHOST_THEMES.map((theme) => (
            <div
              key={theme.id}
              className={`p-5 rounded-2xl border space-y-3 transition-all ${
                activeTheme.id === theme.id
                  ? 'bg-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100">{theme.name}</h3>
                {activeTheme.id === theme.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Transforms colors, borders, cards, and animations across all GhostOS workspaces.
              </p>
              <button
                onClick={() => handleSelectTheme(theme.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTheme.id === theme.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {activeTheme.id === theme.id ? 'Active Theme' : 'Apply Theme'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
