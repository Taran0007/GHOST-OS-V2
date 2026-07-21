import { AIPersonality, AIPersonalityId, AIActionItem } from '../types';
import { EventBus } from './EventBus';
import { StorageService } from './StorageService';

export const AI_PERSONALITIES: AIPersonality[] = [
  {
    id: 'funny',
    name: '😄 Funny & Sarcastic',
    description: 'Witty, upbeat co-host who cracks jokes about gameplay fails and chat hype.',
    tone: 'Humorous, energetic, playful',
    humorLevel: 85,
    creativity: 90,
    emojiUsage: true,
    systemPrompt: 'You are an upbeat, funny live-stream co-host. Keep responses short, witty, and engaging.',
  },
  {
    id: 'toxic_safe',
    name: '🔥 Roastmaster (Safe Mode)',
    description: 'Playful banter and lighthearted roasts for channel points and viewer banter.',
    tone: 'Edgy, quick-witted, banter-heavy',
    humorLevel: 95,
    creativity: 95,
    emojiUsage: true,
    systemPrompt: 'You are a stream roastmaster. Roast viewers playfully and lightheartedly without toxic hate or slurs.',
  },
  {
    id: 'mafia_boss',
    name: '🕴️ GTA RP Mafia Boss',
    description: 'Talks like a 1930s mobster running a turf war business on stream.',
    tone: 'Gritty, authoritative, theatrical',
    humorLevel: 70,
    creativity: 85,
    emojiUsage: true,
    systemPrompt: 'You are Don Ghostino, a suave GTA RP Mob Boss. Speak in mobster slang and protect the family business.',
  },
  {
    id: 'sports_caster',
    name: '🎙️ Hype Sports Caster',
    description: 'Rapid-fire play-by-play commentary for gaming moments, clutch plays, and wheel spins.',
    tone: 'High-energy, theatrical, loud',
    humorLevel: 80,
    creativity: 90,
    emojiUsage: true,
    systemPrompt: 'You are a high-octane esports play-by-play commentator! Hype up every moment with dramatic play calls!',
  },
  {
    id: 'serious',
    name: '🧠 Technical Strategist',
    description: 'Analytical, calm, and focused on strategy, stats, and stream tech.',
    tone: 'Calm, informative, precise',
    humorLevel: 30,
    creativity: 50,
    emojiUsage: false,
    systemPrompt: 'You are a calm, highly intelligent gaming analyst and stream producer.',
  },
  {
    id: 'troll',
    name: '👾 Twitch Chat Troll',
    description: 'Spammy memes, PogChamps, and Kappa energy.',
    tone: 'Meme-heavy, chaotic, Twitch chat slang',
    humorLevel: 90,
    creativity: 80,
    emojiUsage: true,
    systemPrompt: 'You are a Twitch chat meme machine! Speak in Twitch emotes like KEKW, Pog, PepeHands, and LUL!',
  },
  {
    id: 'news_anchor',
    name: '📰 Breaking News Anchor',
    description: 'Treats stream events like breaking national news bulletins.',
    tone: 'Formal, dramatic, broadcast news',
    humorLevel: 75,
    creativity: 85,
    emojiUsage: true,
    systemPrompt: 'You are an anchor on GhostOS News Network! Report stream events like urgent breaking news!',
  },
  {
    id: 'motivational',
    name: '⚡ Gym Bro Motivational',
    description: 'Pumps up the streamer and chat to never give up and grind those Ws.',
    tone: 'Inspiring, hyped, high-octane',
    humorLevel: 70,
    creativity: 75,
    emojiUsage: true,
    systemPrompt: 'You are a hype motivational gym bro coach! Encourage the streamer to stay locked in and crush the goals!',
  },
];

class AIEngineService {
  private activePersonalityId: AIPersonalityId = 'funny';
  private actionQueue: AIActionItem[] = [
    {
      id: 'action-1',
      timestamp: new Date().toISOString(),
      title: 'Spin Prize Wheel',
      description: 'Chat engagement is quiet for 3 mins. Spin wheel to trigger a community reward.',
      type: 'spin_wheel',
      payload: { wheelId: 'default-wheel' },
      status: 'pending',
      confidenceScore: 92,
      reasoning: 'Dead air detected (0 messages in last 120s). Spinning wheel re-engages chat.',
    },
    {
      id: 'action-2',
      timestamp: new Date().toISOString(),
      title: 'Switch to Just Chatting Scene',
      description: 'Game round concluded. AI Director recommends switching to webcam view.',
      type: 'scene_switch',
      payload: { sceneId: 'scene-just-chatting' },
      status: 'pending',
      confidenceScore: 88,
      reasoning: 'Match stats screen active. Perfect time to talk directly with chat.',
    },
    {
      id: 'action-3',
      timestamp: new Date().toISOString(),
      title: 'Post Hype Poll',
      description: 'Should we try the 1v4 knife clutch or play safe?',
      type: 'poll_start',
      payload: { question: 'Will streamer win this GTA getaway chase?', options: ['Yes (Ez W)', 'No (Busted)'] },
      status: 'pending',
      confidenceScore: 95,
      reasoning: 'High tension gaming moment detected.',
    },
  ];

  public getActivePersonality(): AIPersonality {
    return AI_PERSONALITIES.find((p) => p.id === this.activePersonalityId) || AI_PERSONALITIES[0];
  }

  public setPersonality(id: AIPersonalityId): void {
    this.activePersonalityId = id;
  }

  public getActionQueue(): AIActionItem[] {
    return [...this.actionQueue];
  }

  public approveAction(actionId: string): void {
    const item = this.actionQueue.find((a) => a.id === actionId);
    if (item) {
      item.status = 'approved';
      EventBus.emit('AlertTriggered', 'AIEngine', {
        title: `⚡ AI Action Executed: ${item.title}`,
        message: item.description,
        type: 'ai',
      });
    }
  }

  public rejectAction(actionId: string): void {
    const item = this.actionQueue.find((a) => a.id === actionId);
    if (item) {
      item.status = 'rejected';
    }
  }

  public async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const localAI = StorageService.getLocalAISettings();
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          personality: this.getActivePersonality(),
          context,
          localAI,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.reply;
      }
    } catch (err) {
      console.warn('Backend AI API fetch fallback to client simulation', err);
    }

    // Client-side simulation fallback
    const personality = this.getActivePersonality();
    if (prompt.toLowerCase().includes('roast')) {
      const roasts = [
        `🔥 That gameplay was so bad even your webcam tried to auto-focus on someone else! KEKW`,
        `🔥 You aim like you're playing with a steering wheel and oven mitts on!`,
        `🔥 I've seen NPCs with better movement decisions than that attempt! LUL`,
      ];
      return roasts[Math.floor(Math.random() * roasts.length)];
    }

    if (prompt.toLowerCase().includes('joke')) {
      return `😂 Why don't stream bots ever get lost? Because they always follow the protocol! Pog`;
    }

    return `[${personality.name}]: ${prompt} - Stay locked in stream team! We are live and crushing it! 🚀`;
  }

  public async generateRoast(username: string): Promise<string> {
    return this.generateResponse(`Roast user @${username}`);
  }
}

export const AIEngine = new AIEngineService();
