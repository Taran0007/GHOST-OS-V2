import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Play,
  Plus,
  CheckCircle,
  Zap,
  ArrowRight,
  Layers,
  Bot,
  Volume2,
  Disc,
  Trash2,
  Tv,
  Radio,
  Flame,
  Sparkles,
  Check,
  RotateCcw,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';
import { FlowEngine, PRESET_FLOW_ROUTINES } from '../core/FlowEngine';
import { FlowRoutine, FlowNode } from '../types';
import { EventBus } from '../core/EventBus';

export const FlowBuilderView: React.FC = () => {
  const [routines, setRoutines] = useState<FlowRoutine[]>(FlowEngine.getRoutines());
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    routines[0]?.id || 'flow-preset-meme-overlay'
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Custom Flow Routine Form Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [triggerType, setTriggerType] = useState<'keyword' | 'reward' | 'obs_scene'>('keyword');
  const [triggerKeyword, setTriggerKeyword] = useState('!hype');
  const [triggerScene, setTriggerScene] = useState('🎮 Gaming Main');
  const [actionType, setActionType] = useState<'meme_overlay' | 'ai_roast' | 'sound' | 'wheel' | 'obs_scene'>('meme_overlay');
  const [actionPayload, setActionPayload] = useState('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWkzaHF4aW1sdGg4azVsNXNydjQyZHc1bXFpdnlmdThic3R4MmcwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPbDhAzsrtdB3unK9v/giphy.gif');

  // Test Simulation Keyword Input
  const [testKeywordInput, setTestKeywordInput] = useState('!meme');

  useEffect(() => {
    const unsub = EventBus.subscribe('FlowRoutinesUpdated', () => {
      setRoutines([...FlowEngine.getRoutines()]);
    });
    return () => unsub();
  }, []);

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0] || PRESET_FLOW_ROUTINES[0];

  const handleToggleRoutine = (id: string) => {
    FlowEngine.toggleRoutine(id);
    setRoutines([...FlowEngine.getRoutines()]);
  };

  const handleDeleteRoutine = (id: string) => {
    FlowEngine.deleteRoutine(id);
    const updated = FlowEngine.getRoutines();
    setRoutines([...updated]);
    if (updated.length > 0) {
      setSelectedRoutineId(updated[0].id);
    }
  };

  const handleExecuteTest = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    FlowEngine.executeRoutine(routineId, { user: 'TestStreamer' });
    setStatusMsg(`⚡ Executed Flow Routine: "${routine?.name || routineId}"! Check live overlay & audio.`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleSimulateChatKeyword = () => {
    setStatusMsg(`💬 Simulating incoming chat message: "${testKeywordInput}"...`);
    EventBus.emit('ChatMessage', 'FlowBuilder', {
      id: Date.now().toString(),
      platform: 'twitch',
      username: 'TestViewer_99',
      message: testKeywordInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleLoadPreset = (preset: FlowRoutine) => {
    const exists = routines.some((r) => r.id === preset.id);
    if (exists) {
      setStatusMsg(`Preset "${preset.name}" is already loaded!`);
    } else {
      FlowEngine.addRoutine({ ...preset, id: `${preset.id}_${Date.now()}` });
      setRoutines([...FlowEngine.getRoutines()]);
      setSelectedRoutineId(preset.id);
      setStatusMsg(`✅ Preset "${preset.name}" loaded into your automations!`);
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleCreateCustomRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRoutineId = `custom_flow_${Date.now()}`;
    const nodes: FlowNode[] = [
      {
        id: `node_${Date.now()}_1`,
        type: 'trigger',
        title:
          triggerType === 'keyword'
            ? `Trigger: Chat Keyword "${triggerKeyword}"`
            : triggerType === 'reward'
            ? `Trigger: Channel Point Reward Claimed`
            : `Trigger: OBS Scene "${triggerScene}"`,
        category: triggerType === 'obs_scene' ? 'obs' : 'chat',
        config: {
          keyword: triggerType === 'keyword' ? triggerKeyword : undefined,
          event: triggerType === 'reward' ? 'RewardClaimed' : undefined,
          sceneName: triggerType === 'obs_scene' ? triggerScene : undefined,
        },
        position: { x: 50, y: 100 },
      },
      {
        id: `node_${Date.now()}_2`,
        type: 'action',
        title:
          actionType === 'meme_overlay'
            ? 'Action: Display Meme Video Overlay'
            : actionType === 'ai_roast'
            ? 'Action: AI Generate Roast'
            : actionType === 'sound'
            ? 'Action: Play Sound Effect'
            : actionType === 'wheel'
            ? 'Action: Spin Prize Wheel'
            : `Action: Switch Scene to "${actionPayload}"`,
        category:
          actionType === 'meme_overlay' || actionType === 'obs_scene'
            ? 'obs'
            : actionType === 'ai_roast'
            ? 'ai'
            : actionType === 'sound'
            ? 'sound'
            : 'wheel',
        config: {
          action: actionType,
          url: actionType === 'meme_overlay' ? actionPayload : undefined,
          sceneName: actionType === 'obs_scene' ? actionPayload : undefined,
          durationSeconds: 5,
        },
        position: { x: 350, y: 100 },
      },
    ];

    const routine: FlowRoutine = {
      id: newRoutineId,
      name: newTitle.trim(),
      description: newDesc.trim() || 'Custom user-created stream automation flow',
      enabled: true,
      nodes,
      connections: [{ id: `conn_${Date.now()}`, fromNodeId: nodes[0].id, toNodeId: nodes[1].id }],
    };

    FlowEngine.addRoutine(routine);
    setRoutines([...FlowEngine.getRoutines()]);
    setSelectedRoutineId(newRoutineId);
    setIsCreating(false);

    setNewTitle('');
    setNewDesc('');
    setStatusMsg(`🎉 Custom Automation Flow "${routine.name}" created and saved!`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const categoryColor = (cat: FlowNode['category']) => {
    switch (cat) {
      case 'obs':
        return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300';
      case 'ai':
        return 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300';
      case 'sound':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
      case 'wheel':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
      default:
        return 'border-purple-500/40 bg-purple-500/10 text-purple-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            Practical Flow Automation Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build custom IF-THEN triggers and multi-action stream routines that automatically trigger meme video overlays, sound effects, AI roasts, and OBS scenes!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Create Custom Flow
          </button>

          {selectedRoutine && (
            <button
              onClick={() => handleExecuteTest(selectedRoutine.id)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-600/20"
            >
              <Play className="w-4 h-4 fill-current" /> Execute Selected Flow
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 font-bold flex items-center gap-2 shadow-md animate-fade-in">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          {statusMsg}
        </div>
      )}

      {/* Real-time Live Event Simulator Bar */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">Real-time Automation Trigger Tester:</span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={testKeywordInput}
            onChange={(e) => setTestKeywordInput(e.target.value)}
            placeholder="Type chat keyword e.g. !roast or !meme"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSimulateChatKeyword}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Simulate Chat Trigger
          </button>
        </div>
      </div>

      {/* Preset Library Quick Ingestion */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
        <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Official Automation Flow Presets
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRESET_FLOW_ROUTINES.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-2 group shadow-sm"
            >
              <div className="font-bold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors">
                {preset.name}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">{preset.description}</p>
              <button className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 pt-1">
                <Plus className="w-3 h-3" /> Add Preset Workflow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Routines Sidebar | Visual Node Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routines Sidebar */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Active Routines ({routines.length})
            </h2>
          </div>

          <div className="space-y-2">
            {routines.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRoutineId(r.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedRoutine?.id === r.id
                    ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-200 truncate">{r.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRoutine(r.id);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        r.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {r.enabled ? 'ACTIVE' : 'OFF'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoutine(r.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete routine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">{r.description}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Nodes: {r.nodes.length} | Triggers: {r.nodes[0]?.title || 'Configured'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Flow Canvas */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          {selectedRoutine ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">{selectedRoutine.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedRoutine.description}</p>
                </div>
                <button
                  onClick={() => handleExecuteTest(selectedRoutine.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Test Execute Flow
                </button>
              </div>

              {/* Node Flow Visual Diagram */}
              <div className="space-y-4 relative py-2">
                {selectedRoutine.nodes.map((node, index) => (
                  <React.Fragment key={node.id}>
                    <div
                      className={`p-4 rounded-2xl border space-y-2 relative transition-all ${categoryColor(
                        node.category
                      )} shadow-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5">
                          {node.type === 'trigger' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                          {node.type === 'condition' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                          {node.type === 'action' && <Play className="w-3.5 h-3.5 text-cyan-400" />}
                          {node.type.toUpperCase()}: {node.category.toUpperCase()}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950/60 font-mono text-slate-400">
                          {node.id}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-100">{node.title}</div>
                      <div className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        Config: {JSON.stringify(node.config)}
                      </div>
                    </div>

                    {index < selectedRoutine.nodes.length - 1 && (
                      <div className="flex justify-center my-1">
                        <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 animate-pulse" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              No routine selected. Create or select a routine from the list.
            </div>
          )}
        </div>
      </div>

      {/* Modal / Form for Custom Flow Routine Creation */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" /> Build Custom Automation Flow
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateCustomRoutine} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Automation Flow Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 🐶 Cute Dog Meme Trigger on !dog"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Triggers video overlay when chat types keyword"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Trigger Choice */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="block font-bold text-cyan-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Select Trigger Event (IF)
                </label>

                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none"
                >
                  <option value="keyword">💬 Chat Keyword (e.g. !hype, !roast, !meme)</option>
                  <option value="reward">🎁 Twitch Channel Point Reward Claimed</option>
                  <option value="obs_scene">🎥 OBS Scene Switched</option>
                </select>

                {triggerType === 'keyword' && (
                  <input
                    type="text"
                    value={triggerKeyword}
                    onChange={(e) => setTriggerKeyword(e.target.value)}
                    placeholder="!hype"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                )}

                {triggerType === 'obs_scene' && (
                  <input
                    type="text"
                    value={triggerScene}
                    onChange={(e) => setTriggerScene(e.target.value)}
                    placeholder="🎮 Gaming Main"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                )}
              </div>

              {/* Action Choice */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="block font-bold text-indigo-400 flex items-center gap-1">
                  <Play className="w-3.5 h-3.5" /> Select Action Execution (THEN)
                </label>

                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none"
                >
                  <option value="meme_overlay">🎬 Display Video / Meme Overlay on Stream</option>
                  <option value="ai_roast">🤖 AI Co-Host Auto Roast User in Chat</option>
                  <option value="sound">🔊 Play Sound Effect (Air Horn / Fanfare)</option>
                  <option value="obs_scene">🎥 Switch OBS Scene</option>
                  <option value="wheel">🎡 Spin Interactive Prize Wheel</option>
                </select>

                {(actionType === 'meme_overlay' || actionType === 'obs_scene') && (
                  <input
                    type="text"
                    value={actionPayload}
                    onChange={(e) => setActionPayload(e.target.value)}
                    placeholder={actionType === 'meme_overlay' ? 'Video/GIF URL' : 'Scene Name'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 shadow-md shadow-cyan-500/20"
                >
                  <Check className="w-4 h-4" /> Save & Activate Automation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
