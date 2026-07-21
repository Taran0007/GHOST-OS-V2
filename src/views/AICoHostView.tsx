import React, { useState } from 'react';
import {
  Bot,
  Flame,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  RefreshCw,
  Send,
  Zap,
  Cpu,
  Server,
  Activity,
  Sliders,
  Volume2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { AIEngine, AI_PERSONALITIES } from '../core/AIEngine';
import { StorageService } from '../core/StorageService';
import { EventBus } from '../core/EventBus';
import { AIPersonalityId, LocalAISettings, AIProvider } from '../types';

export const AICoHostView: React.FC = () => {
  const [activePersona, setActivePersona] = useState(AIEngine.getActivePersonality());
  const [localAISettings, setLocalAISettings] = useState<LocalAISettings>(StorageService.getLocalAISettings());
  const [testResult, setTestResult] = useState<{ status: string; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [roastTarget, setRoastTarget] = useState('');
  const [roastOutput, setRoastOutput] = useState('');
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastStatus, setRoastStatus] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState('');

  const handleSendRoastToLiveChat = () => {
    if (!roastOutput) return;
    EventBus.emit('ChatMessage', 'AICoHostView', {
      id: `m_${Date.now()}`,
      platform: 'twitch',
      username: `${activePersona.name}_AI`,
      userColor: '#ec4899',
      badges: ['bot', 'ai'],
      message: roastOutput,
      timestamp: new Date().toLocaleTimeString(),
      sentiment: 'hype',
    });
    EventBus.emit('AlertTriggered', 'AICoHostView', {
      title: '🔥 Roast Sent to Live Multi-Chat!',
      message: roastOutput,
      type: 'chat',
    });
    setRoastStatus('✅ Sent roast to Live Chat!');
    setTimeout(() => setRoastStatus(null), 3000);
  };

  const handleReadRoastAloud = () => {
    if (!roastOutput) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(roastOutput);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
      setRoastStatus('🔊 Speaking roast aloud...');
      setTimeout(() => setRoastStatus(null), 3000);
    } else {
      alert('Speech Synthesis API is not supported in this browser.');
    }
  };

  const handleCopyRoast = () => {
    if (!roastOutput) return;
    navigator.clipboard.writeText(roastOutput);
    setRoastStatus('📋 Copied roast to clipboard!');
    setTimeout(() => setRoastStatus(null), 2500);
  };
  const [aiChatLog, setAiChatLog] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: `Hello stream team! I'm active as ${activePersona.name}. Ask me to roast someone, summarize chat, or suggest stream ideas!`,
    },
  ]);
  const [actions, setActions] = useState(AIEngine.getActionQueue());

  const handleUpdateLocalAI = (updated: Partial<LocalAISettings>) => {
    const next = { ...localAISettings, ...updated };
    setLocalAISettings(next);
    StorageService.saveLocalAISettings(next);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localAISettings),
      });
      const data = await res.json();
      if (data.status === 'online') {
        setTestResult({
          status: 'success',
          text: `✅ ${data.provider.toUpperCase()} Online at ${data.host}! Models: ${
            data.availableModels?.join(', ') || 'Connected'
          }`,
        });
      } else {
        setTestResult({
          status: 'error',
          text: `❌ ${data.error || 'Connection failed'}`,
        });
      }
    } catch (e: any) {
      setTestResult({
        status: 'error',
        text: `❌ Error connecting to server backend: ${e?.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePersonaSelect = (id: AIPersonalityId) => {
    AIEngine.setPersonality(id);
    setActivePersona(AIEngine.getActivePersonality());
  };

  const handleGenerateRoast = async () => {
    if (!roastTarget.trim()) return;
    setIsRoasting(true);
    const roast = await AIEngine.generateRoast(roastTarget);
    setRoastOutput(roast);
    setIsRoasting(false);
  };

  const handleSendPrompt = async () => {
    if (!promptInput.trim()) return;
    const userText = promptInput;
    setPromptInput('');
    setAiChatLog((prev) => [...prev, { sender: 'user', text: userText }]);

    const aiReply = await AIEngine.generateResponse(userText);
    setAiChatLog((prev) => [...prev, { sender: 'ai', text: aiReply }]);
  };

  const handleApproveAction = (id: string) => {
    AIEngine.approveAction(id);
    setActions(AIEngine.getActionQueue());
  };

  const handleRejectAction = (id: string) => {
    AIEngine.rejectAction(id);
    setActions(AIEngine.getActionQueue());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            AI Companion, Co-Host & Director
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hybrid AI Engine with Cloud Gemini 3.6 Flash & Local PC LLM support (Ollama, LM Studio, Llama 3, DeepSeek).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
          Active: {activePersona.name}
        </div>
      </div>

      {/* Local AI / Provider Configuration Selector */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">AI Model Provider</h2>
              <p className="text-[11px] text-slate-400">Choose between Cloud Gemini or Local PC LLM (Ollama, LM Studio)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateLocalAI({ provider: 'gemini' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                localAISettings.provider === 'gemini'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Gemini 3.6 Flash
            </button>
            <button
              onClick={() => handleUpdateLocalAI({ provider: 'ollama' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                localAISettings.provider === 'ollama'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" /> Local Ollama
            </button>
            <button
              onClick={() => handleUpdateLocalAI({ provider: 'lmstudio' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                localAISettings.provider === 'lmstudio'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> LM Studio
            </button>
          </div>
        </div>

        {/* Dynamic Provider Settings Inputs */}
        {localAISettings.provider === 'ollama' && (
          <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-indigo-400" /> Ollama Local LLM Configuration
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Runs offline on PC hardware</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Ollama Host Endpoint</label>
                <input
                  type="text"
                  value={localAISettings.ollamaHost}
                  onChange={(e) => handleUpdateLocalAI({ ollamaHost: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Local Model Name</label>
                <input
                  type="text"
                  value={localAISettings.ollamaModel}
                  onChange={(e) => handleUpdateLocalAI({ ollamaModel: e.target.value })}
                  placeholder="llama3, mistral, gemma2, deepseek-r1"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={localAISettings.autoFallbackToGemini}
                  onChange={(e) => handleUpdateLocalAI({ autoFallbackToGemini: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-900 text-cyan-500"
                />
                Fallback to Gemini if local Ollama is offline
              </label>

              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5" /> {isTesting ? 'Testing...' : 'Test Ollama Connection'}
              </button>
            </div>
          </div>
        )}

        {localAISettings.provider === 'lmstudio' && (
          <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" /> LM Studio Local Server Configuration
              </span>
              <span className="text-[10px] text-slate-500 font-mono">OpenAI-Compatible Local Endpoint</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">LM Studio Server Host</label>
                <input
                  type="text"
                  value={localAISettings.lmStudioHost}
                  onChange={(e) => handleUpdateLocalAI({ lmStudioHost: e.target.value })}
                  placeholder="http://localhost:1234/v1"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Model ID</label>
                <input
                  type="text"
                  value={localAISettings.lmStudioModel}
                  onChange={(e) => handleUpdateLocalAI({ lmStudioModel: e.target.value })}
                  placeholder="local-model"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={localAISettings.autoFallbackToGemini}
                  onChange={(e) => handleUpdateLocalAI({ autoFallbackToGemini: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-900 text-cyan-500"
                />
                Fallback to Gemini if local LM Studio is offline
              </label>

              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5" /> {isTesting ? 'Testing...' : 'Test LM Studio Connection'}
              </button>
            </div>
          </div>
        )}

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs font-mono border ${
              testResult.status === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.text}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personality Selector */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Co-Host Personalities
          </h2>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {AI_PERSONALITIES.map((persona) => (
              <button
                key={persona.id}
                onClick={() => handlePersonaSelect(persona.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all space-y-1 ${
                  activePersona.id === persona.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-600/20 border-cyan-500/50 text-slate-100 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-bold flex items-center justify-between text-slate-200">
                  <span>{persona.name}</span>
                  {activePersona.id === persona.id && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{persona.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
                  <span>Humor: {persona.humorLevel}%</span>
                  <span>Creativity: {persona.creativity}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Live Co-Host Chat & Roast Generator */}
        <div className="space-y-6">
          {/* AI Roast Engine */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              AI Roast & Banter Machine
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter viewer username (e.g. GhostRider99)..."
                value={roastTarget}
                onChange={(e) => setRoastTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleGenerateRoast}
                disabled={isRoasting}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
              >
                {isRoasting ? 'Roasting...' : 'Roast! 🔥'}
              </button>
            </div>

            {roastStatus && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 font-bold flex items-center justify-between">
                <span>{roastStatus}</span>
              </div>
            )}

            {roastOutput && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2.5 animate-fade-in">
                <p className="text-xs text-rose-200 font-medium leading-relaxed">
                  {roastOutput}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-rose-500/20 flex-wrap">
                  <button
                    onClick={handleSendRoastToLiveChat}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30"
                  >
                    <Send className="w-3.5 h-3.5" /> Send to Live Chat
                  </button>

                  <button
                    onClick={handleReadRoastAloud}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Read Aloud (TTS)
                  </button>

                  <button
                    onClick={handleCopyRoast}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Co-Host Interactive Console */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3 flex flex-col h-80">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Co-Host Prompt Console
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {aiChatLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border ${
                    log.sender === 'user'
                      ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200 font-medium'
                  }`}
                >
                  <span className="text-[10px] block font-mono text-slate-500 uppercase mb-0.5">
                    {log.sender === 'user' ? 'Streamer' : activePersona.name}
                  </span>
                  {log.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder="Ask Co-Host for advice or jokes..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleSendPrompt}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Director Auto Action Approvals Queue */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            AI Action Approval Queue
          </h2>

          <div className="space-y-3">
            {actions.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{act.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    {act.confidenceScore}% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{act.description}</p>

                {act.status === 'pending' ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApproveAction(act.id)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectAction(act.id)}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 capitalize italic">
                    Status: {act.status}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
