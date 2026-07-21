import { GhostOSTheme, ThemeId } from '../types';
import { EventBus } from './EventBus';

export const GHOST_THEMES: GhostOSTheme[] = [
  {
    id: 'dark_glass',
    name: '🌌 Dark Glassmorphism (Default)',
    bgClass: 'bg-slate-950 text-slate-100',
    cardClass: 'bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-lg shadow-black/40',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accentColor: 'from-cyan-500 to-indigo-600',
    borderClass: 'border-slate-800',
    glowClass: 'shadow-cyan-500/20',
  },
  {
    id: 'neon_cyberpunk',
    name: '⚡ Cyberpunk Neon',
    bgClass: 'bg-zinc-950 text-zinc-100',
    cardClass: 'bg-zinc-900/90 backdrop-blur-lg border border-pink-500/40 shadow-xl shadow-pink-500/10',
    textPrimary: 'text-pink-100',
    textSecondary: 'text-zinc-400',
    accentColor: 'from-pink-500 via-purple-500 to-cyan-400',
    borderClass: 'border-pink-500/30',
    glowClass: 'shadow-pink-500/30',
  },
  {
    id: 'gta_sunset',
    name: '🌴 GTA Vice Sunset',
    bgClass: 'bg-slate-950 text-orange-100',
    cardClass: 'bg-slate-900/80 backdrop-blur-md border border-amber-500/30 shadow-lg shadow-amber-950/50',
    textPrimary: 'text-amber-100',
    textSecondary: 'text-amber-300/60',
    accentColor: 'from-amber-500 via-orange-500 to-rose-600',
    borderClass: 'border-amber-500/30',
    glowClass: 'shadow-orange-500/20',
  },
  {
    id: 'slate_minimal',
    name: '📐 Slate Studio Minimal',
    bgClass: 'bg-slate-900 text-slate-100',
    cardClass: 'bg-slate-800/90 border border-slate-700 shadow-md',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accentColor: 'from-blue-600 to-indigo-600',
    borderClass: 'border-slate-700',
  },
  {
    id: 'light_pro',
    name: '☀️ Light Clean Studio',
    bgClass: 'bg-slate-100 text-slate-900',
    cardClass: 'bg-white border border-slate-200/80 shadow-md shadow-slate-200/50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-500',
    accentColor: 'from-indigo-600 to-blue-600',
    borderClass: 'border-slate-200',
  },
];

class ThemeEngineService {
  private activeThemeId: ThemeId = 'dark_glass';

  constructor() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ghostos_active_theme') as ThemeId;
      if (savedTheme && GHOST_THEMES.some((t) => t.id === savedTheme)) {
        this.activeThemeId = savedTheme;
      }
    }
  }

  public getActiveTheme(): GhostOSTheme {
    return GHOST_THEMES.find((t) => t.id === this.activeThemeId) || GHOST_THEMES[0];
  }

  public setTheme(id: ThemeId): void {
    this.activeThemeId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_active_theme', id);
    }
    const theme = this.getActiveTheme();
    EventBus.emit('ThemeChanged', 'ThemeEngine', { themeId: id, theme });
  }
}

export const ThemeEngine = new ThemeEngineService();
