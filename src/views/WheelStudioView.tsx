import React, { useState, useRef, useEffect } from 'react';
import { Disc, Play, Plus, Trash2, Award, Sparkles, Layers, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WheelEntry } from '../types';
import { EventBus } from '../core/EventBus';

const DEFAULT_ENTRIES: WheelEntry[] = [
  { id: '1', label: '🎉 1,000 Stream Points', color: '#06b6d4', weight: 3 },
  { id: '2', label: '🔥 AI Roast Streamer', color: '#f43f5e', weight: 2 },
  { id: '3', label: '🍸 Free Nightclub VIP RP', color: '#a855f7', weight: 2 },
  { id: '4', label: '🍕 Streamer Orders Pizza', color: '#f59e0b', weight: 1 },
  { id: '5', label: '🚗 GTA RP Car Giveaway', color: '#10b981', weight: 1 },
  { id: '6', label: '💬 Choose Next Game Scene', color: '#3b82f6', weight: 2 },
];

export const WheelStudioView: React.FC = () => {
  const [entries, setEntries] = useState<WheelEntry[]>(DEFAULT_ENTRIES);
  const [newLabel, setNewLabel] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<{ winner: string; timestamp: string }[]>([
    { winner: '🎉 1,000 Stream Points', timestamp: '09:30 AM' },
    { winner: '🔥 AI Roast Streamer', timestamp: '09:15 AM' },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    drawWheel();
  }, [entries]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, width, height);

    if (entries.length === 0) return;

    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    let startAngle = rotationRef.current;

    entries.forEach((entry) => {
      const sliceAngle = (entry.weight / totalWeight) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = entry.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(entry.label, radius - 20, 4);
      ctx.restore();

      startAngle += sliceAngle;
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
  };

  const spinWheel = () => {
    if (isSpinning || entries.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const spinAngle = Math.random() * 20 + 30; // degrees
    const duration = 4000; // ms
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        rotationRef.current += (spinAngle * (1 - easeOut) * Math.PI) / 180;
        drawWheel();
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Determine winner based on top pointer (270deg / 1.5*PI radians, top of canvas 12 o'clock)
        const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
        const pointerAngle = 1.5 * Math.PI; // Top pointer arrow at 12 o'clock
        const normalizedRotation = ((rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const winningAngle = ((pointerAngle - normalizedRotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

        let accumulated = 0;
        let selectedWinner = entries[0].label;
        for (const entry of entries) {
          const slice = (entry.weight / totalWeight) * 2 * Math.PI;
          if (winningAngle >= accumulated && winningAngle < accumulated + slice) {
            selectedWinner = entry.label;
            break;
          }
          accumulated += slice;
        }

        setWinner(selectedWinner);
        setHistory((prev) => [
          { winner: selectedWinner, timestamp: new Date().toLocaleTimeString() },
          ...prev,
        ]);

        // Confetti Fireworks FX
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        EventBus.emit('WheelFinished', 'WheelStudio', { winner: selectedWinner });
      }
    };

    requestAnimationFrame(animate);
  };

  const handleAddEntry = () => {
    if (!newLabel.trim()) return;
    const colors = ['#06b6d4', '#f43f5e', '#a855f7', '#f59e0b', '#10b981', '#3b82f6'];
    const newEntry: WheelEntry = {
      id: Date.now().toString(),
      label: newLabel,
      color: colors[entries.length % colors.length],
      weight: 1,
    };
    setEntries([...entries, newEntry]);
    setNewLabel('');
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Disc className="w-5 h-5 text-cyan-400" />
            Wheel Studio & Interactive Canvas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Physics-based prize spin wheel for channel point redeems, subscriber giveaways, and AI challenges.
          </p>
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          {isSpinning ? 'Spinning Wheel...' : 'SPIN WHEEL NOW!'}
        </button>
      </div>

      {/* Grid: Wheel Canvas | Entries Manager | Winner Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Spans): Wheel Canvas Display */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col items-center justify-center relative min-h-[420px]">
          {/* Pointer */}
          <div className="absolute top-8 z-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-cyan-400 drop-shadow-md"></div>

          <canvas ref={canvasRef} width={380} height={380} className="rounded-full shadow-2xl" />

          {/* Winner Banner Overlay */}
          {winner && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 text-center animate-bounce shadow-xl">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                WINNER ANNOUNCEMENT
              </span>
              <span className="text-base font-bold text-slate-100">{winner}</span>
            </div>
          )}
        </div>

        {/* Right Column: Entry List & Winner Log */}
        <div className="space-y-6">
          {/* Add & Edit Entries */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Wheel Slice Entries
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New wheel prize..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleAddEntry}
                className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: e.color }}
                    ></span>
                    <span className="text-slate-200 truncate">{e.label}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveEntry(e.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Winner History */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Recent Winners Log
            </h2>

            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-200 font-medium truncate">{h.winner}</span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {h.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
