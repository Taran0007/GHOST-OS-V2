import React, { useState } from 'react';
import {
  Grid,
  Volume2,
  Video,
  Disc,
  Flame,
  Play,
  VolumeX,
  Radio,
  Plus,
  Sliders,
  Sparkles,
  Download,
  Music,
  X,
  Check,
  FolderPlus,
} from 'lucide-react';
import { StreamDeckButton, SoundItem } from '../types';
import { OBSService } from '../core/OBSService';
import { AIEngine } from '../core/AIEngine';
import { EventBus } from '../core/EventBus';
import { SoundPlayer } from '../core/SoundPlayer';

const INITIAL_DECK_BUTTONS: StreamDeckButton[] = [
  { id: 'b1', label: '🎮 Gaming Main', icon: 'Video', color: 'from-cyan-600 to-indigo-600', actionType: 'obs_scene', payload: 'scene-main-game', hotkey: 'F1' },
  { id: 'b2', label: '💬 Just Chatting', icon: 'Video', color: 'from-indigo-600 to-purple-600', actionType: 'obs_scene', payload: 'scene-just-chatting', hotkey: 'F2' },
  { id: 'b3', label: '⏳ Starting Soon', icon: 'Video', color: 'from-amber-600 to-orange-600', actionType: 'obs_scene', payload: 'scene-starting-soon', hotkey: 'F3' },
  { id: 'b4', label: '☕ Be Right Back', icon: 'Video', color: 'from-rose-600 to-red-600', actionType: 'obs_scene', payload: 'scene-brb', hotkey: 'F4' },
  { id: 'b5', label: '🎡 Spin Prize Wheel', icon: 'Disc', color: 'from-emerald-600 to-teal-600', actionType: 'spin_wheel', hotkey: 'F5' },
  { id: 'b6', label: '🔥 Roast Chat User', icon: 'Flame', color: 'from-rose-600 to-orange-600', actionType: 'ai_roast', hotkey: 'F6' },
  { id: 'b7', label: '🔊 Play Victory Horn', icon: 'Volume2', color: 'from-blue-600 to-cyan-600', actionType: 'play_sound', payload: 'Victory Horn', hotkey: 'F7' },
  { id: 'b8', label: '🎬 Save Replay Clip', icon: 'Play', color: 'from-purple-600 to-pink-600', actionType: 'obs_scene', payload: 'replay', hotkey: 'F8' },
];

const OPEN_SOURCE_SOUND_PRESETS: SoundItem[] = [
  { id: 's1', name: '🎺 Victory Fanfare Jingle', category: 'Hype', duration: 3.5, volume: 90, hotkey: 'NUM1' },
  { id: 's2', name: '💥 Air Horn Remix', category: 'Hype', duration: 2.1, volume: 85, hotkey: 'NUM2' },
  { id: 's3', name: '😂 Sitcom Laugh Track', category: 'Comedy', duration: 4.0, volume: 80, hotkey: 'NUM3' },
  { id: 's4', name: '🚨 Police Siren GTA', category: 'RP / GTA', duration: 5.2, volume: 95, hotkey: 'NUM4' },
  { id: 's5', name: '💥 Vine Boom Sound', category: 'Meme', duration: 1.5, volume: 95, hotkey: 'NUM5' },
  { id: 's6', name: '🗣️ Bruh Meme Sound', category: 'Meme', duration: 1.2, volume: 90, hotkey: 'NUM6' },
  { id: 's7', name: '💵 Cash Register Cha-Ching', category: 'Hype', duration: 1.8, volume: 85, hotkey: 'NUM7' },
  { id: 's8', name: '🦆 Quack Rubber Duck', category: 'Comedy', duration: 1.0, volume: 80, hotkey: 'NUM8' },
  { id: 's9', name: '🥁 Rimshot Ba-Dum-Tss', category: 'Comedy', duration: 1.5, volume: 85, hotkey: 'NUM9' },
  { id: 's10', name: '⭐ Level Up Achievement', category: 'Gaming', duration: 2.5, volume: 90, hotkey: 'F9' },
  { id: 's11', name: '🤦 Sad Fail Trombone', category: 'Comedy', duration: 4.0, volume: 85, hotkey: 'F10' },
];

export const StreamAndAudioDeckView: React.FC = () => {
  const [deckButtons] = useState<StreamDeckButton[]>(INITIAL_DECK_BUTTONS);
  const [sounds, setSounds] = useState<SoundItem[]>(OPEN_SOURCE_SOUND_PRESETS);
  const [activeTab, setActiveTab] = useState<'deck' | 'sounds'>('deck');
  const [activeOutput, setActiveOutput] = useState<'stream_mic' | 'headphones' | 'both'>('both');

  // New Sound Effect Modal State
  const [isAddSoundModalOpen, setIsAddSoundModalOpen] = useState(false);
  const [newSoundTitle, setNewSoundTitle] = useState('');
  const [newSoundCategory, setNewSoundCategory] = useState('Custom');
  const [newSoundUrl, setNewSoundUrl] = useState('');
  const [newSoundHotkey, setNewSoundHotkey] = useState('NUM0');
  const [notice, setNotice] = useState<string | null>(null);

  const handleDeckClick = async (btn: StreamDeckButton) => {
    if (btn.actionType === 'obs_scene') {
      if (btn.payload === 'replay') {
        OBSService.saveReplayBuffer();
      } else {
        OBSService.switchScene(btn.payload);
      }
    } else if (btn.actionType === 'spin_wheel') {
      EventBus.emit('AlertTriggered', 'VirtualDeck', { title: '🎡 Wheel Spin Triggered!', type: 'wheel' });
    } else if (btn.actionType === 'ai_roast') {
      const roast = await AIEngine.generateRoast('ChatUser');
      alert(`🔥 AI Stream Deck Roast:\n${roast}`);
    } else if (btn.actionType === 'play_sound') {
      playSound(btn.payload || 'Victory Horn');
    }
  };

  const playSound = (sound: SoundItem | string) => {
    const soundName = typeof sound === 'string' ? sound : sound.name;
    const customUrl = typeof sound === 'string' ? undefined : sound.url;
    const volume = typeof sound === 'string' ? 90 : sound.volume;

    // Trigger synth & custom audio player
    SoundPlayer.playSound(soundName, customUrl, volume);

    EventBus.emit('AudioPlayed', 'AudioDeck', { soundName, output: activeOutput });
    EventBus.emit('AlertTriggered', 'AudioDeck', {
      title: `🔊 Playing: ${soundName}`,
      message: `Audio routed to ${activeOutput.toUpperCase()}`,
      type: 'audio',
    });
  };

  const handleVolumeChange = (id: string, vol: number) => {
    setSounds((prev) =>
      prev.map((s) => (s.id === id ? { ...s, volume: Math.max(0, Math.min(100, vol)) } : s))
    );
  };

  const handleAddCustomSound = () => {
    if (!newSoundTitle.trim()) {
      alert('Please enter a sound title.');
      return;
    }
    const newSoundItem: SoundItem = {
      id: `s_${Date.now()}`,
      name: newSoundTitle.trim(),
      category: newSoundCategory,
      duration: 2.5,
      volume: 90,
      hotkey: newSoundHotkey.toUpperCase(),
      url: newSoundUrl.trim() || undefined,
    };
    setSounds((prev) => [...prev, newSoundItem]);
    setIsAddSoundModalOpen(false);
    setNewSoundTitle('');
    setNewSoundUrl('');
    setNotice(`✅ Custom sound "${newSoundItem.name}" added to Soundboard!`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Grid className="w-5 h-5 text-cyan-400" />
            Virtual Stream Deck & Audio Soundboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Macro grid binder with hotkeys, OBS scene switching, AI triggers, and multi-output soundboard.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('deck')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'deck'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Virtual Stream Deck
          </button>
          <button
            onClick={() => setActiveTab('sounds')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'sounds'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" /> Soundboard (Audio Deck)
          </button>
        </div>
      </div>

      {/* Stream Deck Grid View */}
      {activeTab === 'deck' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">Macro Buttons Grid (Page 1)</h2>
            <span className="text-xs text-slate-500 font-mono">Press designated hotkeys or click buttons</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {deckButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleDeckClick(btn)}
                className={`h-32 p-4 rounded-2xl bg-gradient-to-br ${btn.color} text-white font-bold text-sm shadow-xl flex flex-col justify-between hover:scale-105 active:scale-95 transition-all group border border-white/20`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 backdrop-blur font-mono">
                    {btn.hotkey}
                  </span>
                  <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                </div>
                <div className="text-left leading-tight drop-shadow-md">{btn.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Soundboard View */}
      {activeTab === 'sounds' && (
        <div className="space-y-6">
          {notice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center justify-between">
              <span>{notice}</span>
            </div>
          )}

          {/* Audio Output Selector & Custom Sound Action */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Audio Routing Target:</span>
              <div className="flex items-center gap-1.5 ml-2">
                {(['stream_mic', 'headphones', 'both'] as const).map((out) => (
                  <button
                    key={out}
                    onClick={() => setActiveOutput(out)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                      activeOutput === out
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {out.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsAddSoundModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Custom Sound Effect
            </button>
          </div>

          {/* Sound Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sounds.map((sound) => (
              <div
                key={sound.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-slate-200">{sound.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono">
                        {sound.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Hotkey: <span className="text-slate-300 font-bold">{sound.hotkey || 'None'}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => playSound(sound)}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95"
                    title="Play Sound Effect"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>

                {/* Sound Volume Slider */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sound.volume}
                    onChange={(e) => handleVolumeChange(sound.id, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                    {sound.volume}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Sound Modal */}
      {isAddSoundModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 relative">
            <button
              onClick={() => setIsAddSoundModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <FolderPlus className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100">Add Custom Sound Effect</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sound Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bruh Sound Effect, Air Horn, Laugh"
                  value={newSoundTitle}
                  onChange={(e) => setNewSoundTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newSoundCategory}
                    onChange={(e) => setNewSoundCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Hype">Hype</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Meme">Meme</option>
                    <option value="RP / GTA">RP / GTA</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trigger Hotkey</label>
                  <input
                    type="text"
                    placeholder="e.g. NUM7, F9, CTRL+M"
                    value={newSoundHotkey}
                    onChange={(e) => setNewSoundHotkey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Audio URL (MP3/WAV/AAC) <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/sound.mp3 or leave empty for synth generator"
                  value={newSoundUrl}
                  onChange={(e) => setNewSoundUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  If left blank, GhostOS automatically uses its built-in Web Audio API tone generator based on the sound name!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAddSoundModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomSound}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
              >
                <Check className="w-4 h-4" /> Save Sound Effect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
