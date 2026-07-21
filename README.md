# GhostOS — Master Specification v1.0
**Codename:** GhostOS  
**Version:** 1.0.0 (Master Release)  
**Status:** Active  

GhostOS is a modular, plugin-based streaming operating system that unifies broadcasting, AI co-hosting, OBS Studio management, multi-chat, virtual stream deck, soundboard, GTA RP economy, and node-based flow automation.

## Architecture & Design
- **Frontend:** React 19 + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Express full-stack API server + Google Gemini AI SDK
- **Core Services:** EventBus, PluginManager, OBSService, AIEngine, EconomyEngine, FlowEngine, StorageService
- **Plugin Sandbox:** Every major feature operates as a modular, isolated plugin.

## Core Workspaces
1. **Overview Dashboard:** Live stream status, OBS 60fps viewfinder, quick scene switcher, AI Director suggestions, and replay buffer triggers.
2. **Multi-Chat & Overlay:** Single-monitor transparent HUD overlay merging Twitch, Kick, YouTube, and Discord chat with AI reply suggestions.
3. **OBS Studio Manager:** Direct WebSocket control over scenes, source visibilities, audio mixer volume, replay buffers, and frame capture.
4. **AI Co-Host & Companion:** Gemini AI Engine with customizable personalities (Funny, Roastmaster, GTA RP Mob Boss, Sports Caster), auto-action queues, and toxicity monitors.
5. **Stream Deck & Audio Deck:** Macro button grid binder + multi-output soundboard with per-sound volume controls.
6. **Wheel Studio Canvas:** HTML5 canvas spin wheel with weighted probabilities, confetti particle celebrations, and browser source links.
7. **Stream Economy & GTA RP:** Persistent viewer database with XP levels, GTA RP businesses (Nightclubs, Mechanics, Taxi fleets), daily revenue collection, and community giveaways.
8. **Visual Flow Builder:** Node-based stream automation designer connecting triggers (Channel Points, Sub, Quiet Chat) to actions (Scene Switch, Sound Trigger, Wheel Spin, AI Chat).
9. **Plugin & Theme Store:** Marketplace for official & community plugins, themes (Dark Glass, Cyberpunk Neon, GTA Sunset, Light Studio), and overlay packs.
10. **Mobile Companion Mode:** Responsive touch controls & QR code pairing for remote stream management on phone/tablet.
11. **Developer Console:** Real-time Event Bus monitor, system documentation reader (`README`, `PROGRESS`, `ARCHITECTURE`, `PLUGIN_SDK`, `API`, `FLOW_BUILDER`), and backup/restore.
