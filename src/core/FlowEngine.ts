import { FlowRoutine, FlowNode } from '../types';
import { EventBus } from './EventBus';
import { OBSService } from './OBSService';
import { AIEngine } from './AIEngine';
import { StorageService } from './StorageService';

export interface FlowPreset {
  id: string;
  name: string;
  description: string;
  routine: FlowRoutine;
}

export const PRESET_FLOW_ROUTINES: FlowRoutine[] = [
  {
    id: 'flow-preset-meme-overlay',
    name: '🎬 Channel Point Meme Video Trigger',
    description: 'When a viewer redeems channel points or types !meme, display a 5s transparent meme overlay on stream.',
    enabled: true,
    nodes: [
      {
        id: 'n1',
        type: 'trigger',
        title: 'Trigger: Chat Keyword "!meme" or Channel Points',
        category: 'chat',
        config: { keyword: '!meme', event: 'RewardClaimed' },
        position: { x: 50, y: 100 },
      },
      {
        id: 'n2',
        type: 'condition',
        title: 'Condition: Routine Active',
        category: 'chat',
        config: { requireEnabled: true },
        position: { x: 300, y: 100 },
      },
      {
        id: 'n3',
        type: 'action',
        title: 'Action: Display Dancing Cat Meme Overlay',
        category: 'obs',
        config: {
          action: 'meme_overlay',
          url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWkzaHF4aW1sdGg4azVsNXNydjQyZHc1bXFpdnlmdThic3R4MmcwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPbDhAzsrtdB3unK9v/giphy.gif',
          durationSeconds: 5,
        },
        position: { x: 550, y: 100 },
      },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3' },
    ],
  },
  {
    id: 'flow-preset-ai-roast',
    name: '🤖 AI Chatbot Auto-Reply on "!roast"',
    description: 'When someone types "!roast" in multi-chat, AI Co-Host automatically generates a roast response.',
    enabled: true,
    nodes: [
      {
        id: 'n10',
        type: 'trigger',
        title: 'Trigger: Chat Message Keyword "!roast"',
        category: 'chat',
        config: { keyword: '!roast' },
        position: { x: 50, y: 100 },
      },
      {
        id: 'n11',
        type: 'action',
        title: 'Action: AI Generate Roast & Post to Multi-Chat',
        category: 'ai',
        config: { action: 'ai_roast' },
        position: { x: 350, y: 100 },
      },
    ],
    connections: [{ id: 'c10', fromNodeId: 'n10', toNodeId: 'n11' }],
  },
  {
    id: 'flow-preset-sub-victory',
    name: '🎺 VIP Subscriber Victory Fanfare',
    description: 'When a new sub or VIP event occurs, play victory audio fanfare and trigger confetti alert.',
    enabled: true,
    nodes: [
      {
        id: 'n20',
        type: 'trigger',
        title: 'Trigger: New Subscriber / VIP Event',
        category: 'chat',
        config: { event: 'RewardClaimed' },
        position: { x: 50, y: 100 },
      },
      {
        id: 'n21',
        type: 'action',
        title: 'Action: Play Victory Sound Fanfare',
        category: 'sound',
        config: { soundName: 'Victory Fanfare' },
        position: { x: 350, y: 80 },
      },
      {
        id: 'n22',
        type: 'action',
        title: 'Action: Trigger VIP Confetti Alert',
        category: 'wheel',
        config: { alertTitle: '🎉 NEW VIP SUBSCRIBER JOINED!' },
        position: { x: 350, y: 180 },
      },
    ],
    connections: [
      { id: 'c20', fromNodeId: 'n20', toNodeId: 'n21' },
      { id: 'c21', fromNodeId: 'n20', toNodeId: 'n22' },
    ],
  },
  {
    id: 'flow-preset-brb-mute',
    name: '🚨 Emergency BRB Scene Auto-Mute',
    description: 'When switching OBS scene to "Be Right Back", automatically play a chime and post alert.',
    enabled: true,
    nodes: [
      {
        id: 'n30',
        type: 'trigger',
        title: 'Trigger: OBS Scene Switched to "Be Right Back"',
        category: 'obs',
        config: { sceneName: '⏸️ Be Right Back' },
        position: { x: 50, y: 100 },
      },
      {
        id: 'n31',
        type: 'action',
        title: 'Action: Play Chime Sound',
        category: 'sound',
        config: { soundName: 'Rimshot' },
        position: { x: 350, y: 100 },
      },
    ],
    connections: [{ id: 'c30', fromNodeId: 'n30', toNodeId: 'n31' }],
  },
  {
    id: 'flow-preset-spin-wheel',
    name: '🎡 Big Donation Prize Wheel Auto-Spin',
    description: 'When points > 1000 or "!spin" in chat, automatically trigger the live stream prize wheel.',
    enabled: true,
    nodes: [
      {
        id: 'n40',
        type: 'trigger',
        title: 'Trigger: Chat "!spin" or Channel Points > 1000',
        category: 'chat',
        config: { keyword: '!spin' },
        position: { x: 50, y: 100 },
      },
      {
        id: 'n41',
        type: 'action',
        title: 'Action: Spin Interactive Prize Wheel',
        category: 'wheel',
        config: { autoSpin: true },
        position: { x: 350, y: 100 },
      },
    ],
    connections: [{ id: 'c40', fromNodeId: 'n40', toNodeId: 'n41' }],
  },
];

class FlowEngineService {
  private routines: FlowRoutine[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghostos_flow_routines');
      if (saved) {
        try {
          this.routines = JSON.parse(saved);
        } catch {
          this.routines = [...PRESET_FLOW_ROUTINES];
        }
      } else {
        this.routines = [...PRESET_FLOW_ROUTINES];
      }
    } else {
      this.routines = [...PRESET_FLOW_ROUTINES];
    }

    // Attach practical real-time event listeners
    this.setupListeners();
  }

  private setupListeners(): void {
    // 1. Listen for Incoming Chat Messages
    EventBus.subscribe('ChatMessage', (evt) => {
      const msg = evt.payload;
      if (!msg || !msg.message) return;
      const text = msg.message.toLowerCase();

      this.routines.forEach((routine) => {
        if (!routine.enabled) return;

        const triggerNode = routine.nodes.find((n) => n.type === 'trigger');
        if (!triggerNode) return;

        const kw = triggerNode.config?.keyword?.toLowerCase();
        if (kw && text.includes(kw)) {
          this.executeRoutine(routine.id, { user: msg.username, text: msg.message });
        }
      });
    });

    // 2. Listen for Channel Points Redemptions
    EventBus.subscribe('RewardClaimed', (evt) => {
      this.routines.forEach((routine) => {
        if (!routine.enabled) return;
        const triggerNode = routine.nodes.find((n) => n.type === 'trigger');
        if (triggerNode && (triggerNode.config?.event === 'RewardClaimed' || triggerNode.category === 'chat')) {
          this.executeRoutine(routine.id, evt.payload);
        }
      });
    });

    // 3. Listen for OBS Scene Switches
    EventBus.subscribe('SceneSwitched', (evt) => {
      this.routines.forEach((routine) => {
        if (!routine.enabled) return;
        const triggerNode = routine.nodes.find((n) => n.type === 'trigger');
        if (triggerNode && triggerNode.category === 'obs') {
          this.executeRoutine(routine.id, evt.payload);
        }
      });
    });
  }

  public getRoutines(): FlowRoutine[] {
    return this.routines;
  }

  public saveRoutines(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghostos_flow_routines', JSON.stringify(this.routines));
    }
    EventBus.emit('FlowRoutinesUpdated', 'FlowEngine', { routines: this.routines });
  }

  public addRoutine(routine: FlowRoutine): void {
    this.routines.push(routine);
    this.saveRoutines();
  }

  public deleteRoutine(id: string): void {
    this.routines = this.routines.filter((r) => r.id !== id);
    this.saveRoutines();
  }

  public toggleRoutine(id: string): boolean {
    const r = this.routines.find((item) => item.id === id);
    if (r) {
      r.enabled = !r.enabled;
      this.saveRoutines();
      return r.enabled;
    }
    return false;
  }

  public executeRoutine(routineId: string, context?: any): void {
    const routine = this.routines.find((r) => r.id === routineId);
    if (!routine || !routine.enabled) return;

    EventBus.emit('AlertTriggered', 'FlowEngine', {
      title: `⚡ Flow Routine Executed: ${routine.name}`,
      message: routine.description,
      type: 'flow',
    });

    EventBus.emit('FlowExecuted', 'FlowEngine', {
      routineId: routine.id,
      name: routine.name,
      nodeCount: routine.nodes.length,
      context,
    });

    // Execute actions in the routine
    routine.nodes.forEach((node) => {
      if (node.type === 'action') {
        if (node.category === 'obs') {
          if (node.config?.action === 'meme_overlay' || node.config?.url) {
            EventBus.emit('MemeVideoTriggered', 'FlowEngine', {
              title: routine.name,
              videoUrl: node.config.url || 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWkzaHF4aW1sdGg4azVsNXNydjQyZHc1bXFpdnlmdThic3R4MmcwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPbDhAzsrtdB3unK9v/giphy.gif',
              durationSeconds: node.config.durationSeconds || 5,
            });
          } else if (node.config?.sceneName) {
            OBSService.switchScene(node.config.sceneName);
          }
        } else if (node.category === 'ai') {
          const targetUser = context?.user || 'StreamViewer';
          AIEngine.generateRoast(targetUser).then((roast) => {
            EventBus.emit('ChatMessage', 'FlowEngine', {
              id: Date.now().toString(),
              platform: 'system',
              username: '🤖 GhostAI Co-Host',
              message: `🔥 AUTOMATION ROAST for @${targetUser}: ${roast}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          });
        } else if (node.category === 'sound') {
          if (typeof window !== 'undefined' && 'AudioContext' in window) {
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(523.25, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.3);
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
              osc.start();
              osc.stop(ctx.currentTime + 0.3);
            } catch {}
          }
        } else if (node.category === 'wheel') {
          EventBus.emit('WheelFinished', 'FlowEngine', {
            winner: `Flow Reward: ${routine.name}`,
          });
        }
      }
    });
  }
}

export const FlowEngine = new FlowEngineService();
