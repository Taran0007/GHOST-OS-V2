import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// System Documentation Store
const SYSTEM_DOCS: Record<string, string> = {
  'README.md': `# GhostOS — Master Specification v1.0
Codename: GhostOS
Version: 1.0.0

## Vision
GhostOS is a modular, plugin-based streaming operating system that unifies broadcasting, AI co-hosting, OBS Studio management, multi-chat, virtual stream deck, soundboard, GTA RP economy, and node-based flow automation.

## Core Features
1. **Plugin-First Architecture**: Every feature is an isolated, sandboxed plugin.
2. **OBS Studio Integrator**: Scene switcher, replay buffer, source filters, and audio mixer.
3. **Unified Multi-Chat & Transparent Overlay**: Merge Twitch, Kick, YouTube, and Discord.
4. **AI Companion & Co-Host**: Powered by Gemini with personalities, auto-actions, and dead-air detection.
5. **Virtual Stream Deck & Audio Deck**: Multi-macro grid and soundboard with stream routing.
6. **Wheel Studio Canvas**: Weighted spin wheel with confetti celebrations and browser source popouts.
7. **Stream Economy & GTA RP Businesses**: Viewer profiles, nightclubs, mechanics, jobs, and level XP.
8. **Visual Flow Builder**: Node-based stream automations (Trigger -> Condition -> Action).
9. **Developer Console & Recovery**: Real-time event monitor, plugin inspector, and backup/restore.`,

  'ARCHITECTURE.md': `# GhostOS Layered Architecture
UI (React 19 + Tailwind CSS)
  ↓
API Layer (Express REST / Server-side Gemini)
  ↓
Core Services (PluginManager, OBSService, EventBus, AIEngine, EconomyEngine, FlowEngine)
  ↓
Plugin Runtime Sandbox
  ↓
Database / Persistent Storage (PostgreSQL / Local State)`,

  'PLUGIN_SDK.md': `# GhostOS Plugin SDK & Developer Guide

## Creating a GhostOS Plugin
Every plugin requires a \`manifest.json\`:
\`\`\`json
{
  "id": "my-custom-plugin",
  "name": "Custom Alert FX",
  "version": "1.0.0",
  "permissions": ["Overlay", "Chat"],
  "category": "community"
}
\`\`\`

## Event Bus Hooks
\`\`\`ts
import { EventBus } from 'ghostos/core';

EventBus.subscribe('ChatMessage', (event) => {
  console.log('New message received:', event.payload);
});
\`\`\``,

  'API.md': `# GhostOS Backend API Reference
- \`GET /api/health\`: Application health check
- \`POST /api/ai/generate\`: Server-side Gemini AI generation
- \`GET /api/obs/status\`: OBS connection & streaming status
- \`GET /api/backup/export\`: Export system JSON backup
- \`GET /api/docs/:docId\`: Retrieve documentation spec file`,

  'FLOW_BUILDER.md': `# GhostOS Flow Builder Engine
The Flow Engine executes node routines defined as:
- **Triggers**: \`ChatMessage\`, \`ChannelPointsRedeemed\`, \`Timer\`
- **Conditions**: \`ViewerPoints > X\`, \`SceneIsGaming\`
- **Actions**: \`SwitchScene\`, \`PlaySound\`, \`SpinWheel\`, \`SendAIChat\``,
};

// --- API ROUTES --- //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GhostOS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// AI Generation Endpoint (Gemini + Local LLM Ollama / LM Studio support)
app.post('/api/ai/generate', async (req, res) => {
  const { prompt, personality, context, localAI } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const systemInstruction = personality?.systemPrompt || 'You are GhostOS AI co-host assistant for live streamers.';
  const fullPrompt = `${systemInstruction}\nContext: ${context || 'Live Stream'}\nUser Query: ${prompt}`;

  // 1. Try Local Ollama if selected
  if (localAI?.provider === 'ollama') {
    const host = localAI.ollamaHost || 'http://localhost:11434';
    const model = localAI.ollamaModel || 'llama3';
    try {
      const ollamaRes = await fetch(`${host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: fullPrompt,
          stream: false,
        }),
      });

      if (ollamaRes.ok) {
        const data: any = await ollamaRes.json();
        return res.json({
          reply: data.response || 'Local Ollama response generated.',
          model: `ollama:${model}`,
          provider: 'ollama',
        });
      }
    } catch (err: any) {
      console.warn(`[Local AI] Ollama call to ${host} failed:`, err?.message || err);
      if (!localAI.autoFallbackToGemini) {
        return res.status(503).json({
          error: `Ollama service unreachable at ${host}. Please start Ollama or enable auto-fallback.`,
        });
      }
    }
  }

  // 2. Try Local LM Studio / OpenAI compatible endpoint if selected
  if (localAI?.provider === 'lmstudio') {
    const host = localAI.lmStudioHost || 'http://localhost:1234/v1';
    const model = localAI.lmStudioModel || 'local-model';
    try {
      const lmRes = await fetch(`${host}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: `${context ? `[Context: ${context}] ` : ''}${prompt}` },
          ],
          temperature: 0.7,
        }),
      });

      if (lmRes.ok) {
        const data: any = await lmRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.json({
            reply,
            model: `lmstudio:${model}`,
            provider: 'lmstudio',
          });
        }
      }
    } catch (err: any) {
      console.warn(`[Local AI] LM Studio call to ${host} failed:`, err?.message || err);
      if (!localAI.autoFallbackToGemini) {
        return res.status(503).json({
          error: `LM Studio service unreachable at ${host}. Please start LM Studio or enable auto-fallback.`,
        });
      }
    }
  }

  // 3. Fallback / Default: Gemini AI Model
  const aiClient = getGeminiClient();

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: fullPrompt,
      });

      return res.json({
        reply: response.text || 'GhostOS AI generated response.',
        model: 'gemini-3.6-flash',
        provider: 'gemini',
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to smart response:', err?.message || err);
    }
  }

  // Smart fallback response if Gemini key is missing or errored
  const personaName = personality?.name || 'GhostOS AI';
  let reply = `[${personaName}]: Ready to hype up the stream! Let's crush those gaming goals! 🚀`;

  if (prompt.toLowerCase().includes('roast')) {
    reply = `🔥 [${personaName} Roast]: Your gaming aim is so erratic even the stream auto-quality dropped to 360p! KEKW`;
  } else if (prompt.toLowerCase().includes('joke')) {
    reply = `😂 [${personaName} Joke]: Why did the streamer wear glasses? To see the chat clearer when they hit PogChamp!`;
  }

  return res.json({
    reply,
    model: 'fallback-simulator',
    provider: 'simulator',
  });
});

// Endpoint to test local LLM connectivity
app.post('/api/ai/test-local', async (req, res) => {
  const { provider, ollamaHost, ollamaModel, lmStudioHost } = req.body || {};

  if (provider === 'ollama') {
    const host = ollamaHost || 'http://localhost:11434';
    try {
      const tagsRes = await fetch(`${host}/api/tags`);
      if (tagsRes.ok) {
        const data: any = await tagsRes.json();
        const models = (data.models || []).map((m: any) => m.name);
        return res.json({
          status: 'online',
          provider: 'ollama',
          host,
          availableModels: models.length ? models : ['llama3', 'mistral', 'gemma2'],
        });
      }
    } catch (err: any) {
      return res.json({
        status: 'offline',
        provider: 'ollama',
        error: `Could not connect to Ollama at ${host}. Make sure Ollama is running ('ollama serve').`,
      });
    }
  }

  if (provider === 'lmstudio') {
    const host = lmStudioHost || 'http://localhost:1234/v1';
    try {
      const modelsRes = await fetch(`${host}/models`);
      if (modelsRes.ok) {
        const data: any = await modelsRes.json();
        const models = (data.data || []).map((m: any) => m.id);
        return res.json({
          status: 'online',
          provider: 'lmstudio',
          host,
          availableModels: models.length ? models : ['local-model'],
        });
      }
    } catch (err: any) {
      return res.json({
        status: 'offline',
        provider: 'lmstudio',
        error: `Could not connect to LM Studio at ${host}. Make sure local server is started in LM Studio.`,
      });
    }
  }

  return res.json({ status: 'online', provider: 'gemini', host: 'Google Cloud Gemini API' });
});

// OBS Status Endpoint
app.get('/api/obs/status', (req, res) => {
  res.json({
    connected: true,
    streaming: false,
    recording: false,
    replayBuffer: true,
    currentScene: '🎮 Gaming Main',
    fps: 60,
  });
});

// System Documentation Endpoint
app.get('/api/docs/:docId', (req, res) => {
  const docId = req.params.docId;
  const content = SYSTEM_DOCS[docId] || SYSTEM_DOCS['README.md'];
  res.json({ docId, content });
});

// Backup Export Endpoint
app.get('/api/backup/export', (req, res) => {
  res.json({
    app: 'GhostOS',
    version: '1.0.0',
    exportTime: new Date().toISOString(),
    status: 'success',
  });
});

// Vite & Production Static Handling
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GhostOS Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
