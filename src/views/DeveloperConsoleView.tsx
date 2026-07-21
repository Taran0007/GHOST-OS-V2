import React, { useState, useEffect } from 'react';
import {
  Terminal,
  FileText,
  Activity,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  Database,
  Cpu,
} from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { StorageService } from '../core/StorageService';
import { PluginManager } from '../core/PluginManager';
import { GhostEvent, PluginManifest } from '../types';

export const DeveloperConsoleView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'docs' | 'events' | 'backup' | 'plugins'>('docs');
  const [docId, setDocId] = useState<string>('README.md');
  const [docContent, setDocContent] = useState<string>('Loading system specification...');
  const [eventLogs, setEventLogs] = useState<GhostEvent[]>(EventBus.getHistory());
  const [plugins, setPlugins] = useState<PluginManifest[]>(PluginManager.getAllPlugins());
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchDoc(docId);
  }, [docId]);

  useEffect(() => {
    const unsubscribe = EventBus.subscribe('*', () => {
      setEventLogs(EventBus.getHistory());
    });
    return () => unsubscribe();
  }, []);

  const fetchDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/docs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDocContent(data.content || 'Doc content loaded.');
      }
    } catch (err) {
      setDocContent(`# Documentation File: ${id}\nSystem specification available.`);
    }
  };

  const handleDownloadBackup = () => {
    StorageService.downloadBackupJSON();
    setBackupStatus('Downloaded full system JSON state archive.');
    setTimeout(() => setBackupStatus(null), 3000);
  };

  const handleRecoverPlugins = () => {
    PluginManager.recoverCrashedPlugins();
    setPlugins([...PluginManager.getAllPlugins()]);
    setBackupStatus('Recovered all sandbox plugins.');
    setTimeout(() => setBackupStatus(null), 3000);
  };

  const specDocs = [
    { id: 'README.md', label: 'README.md (Master Spec)' },
    { id: 'ARCHITECTURE.md', label: 'ARCHITECTURE.md' },
    { id: 'PLUGIN_SDK.md', label: 'PLUGIN_SDK.md' },
    { id: 'API.md', label: 'API.md' },
    { id: 'FLOW_BUILDER.md', label: 'FLOW_BUILDER.md' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            GhostOS Developer Console & System Specifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live Event Bus monitor, system documentation reader, plugin sandbox inspector, and database backup engine.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'docs' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Specification Docs
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'events' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Event Bus ({eventLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'backup' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Backup & Recovery
          </button>
        </div>
      </div>

      {backupStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {backupStatus}
        </div>
      )}

      {/* Docs Reader View */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2">
              Specification Files
            </span>
            {specDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setDocId(doc.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                  docId === doc.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {doc.label}
              </button>
            ))}
          </div>

          <div className="md:col-span-3 bg-slate-900 rounded-2xl p-6 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto scrollbar-thin">
            {docContent}
          </div>
        </div>
      )}

      {/* Event Bus Log Stream */}
      {activeTab === 'events' && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Real-Time Event Bus Feed
            </h2>
            <button
              onClick={() => EventBus.clearHistory()}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Clear Logs
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 font-mono text-xs">
            {eventLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No events emitted yet.</div>
            ) : (
              eventLogs.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">{evt.type}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {evt.source}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{JSON.stringify(evt.payload)}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{evt.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backup & Recovery Manager */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download Box */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              Full System State JSON Backup
            </h2>
            <p className="text-xs text-slate-400">
              Export all connected stream accounts, theme settings, audio mixer configs, hotkeys, OBS scenes, viewer profiles, GTA RP business states, and flow routines into a portable JSON backup.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              <Download className="w-4 h-4" /> Download Complete Project Backup JSON
            </button>
          </div>

          {/* Restore Box */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              Restore Complete Project Database
            </h2>
            <p className="text-xs text-slate-400">
              Upload or drag a previously saved <code>.json</code> backup file to restore full database, theme, accounts, audio settings, and scenes instantly.
            </p>

            <label className="w-full py-3 px-4 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl bg-slate-950/60 flex flex-col items-center justify-center cursor-pointer transition-colors group">
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors mb-1" />
              <span className="text-xs font-semibold text-slate-300">Select Backup File (.json)</span>
              <span className="text-[10px] text-slate-500">Click to browse or drop file here</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (content) {
                        const success = StorageService.restoreFromJSON(content);
                        if (success) {
                          setBackupStatus('✅ Restored complete project database & configurations!');
                        } else {
                          setBackupStatus('❌ Error: Selected file is not a valid GhostOS backup JSON.');
                        }
                        setTimeout(() => setBackupStatus(null), 4000);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
