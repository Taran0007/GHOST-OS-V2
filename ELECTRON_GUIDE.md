# 🖥️ GhostOS Hybrid Desktop App (Electron PC Integration)

GhostOS is engineered as a **hybrid platform** that operates seamlessly in both web browsers (Cloud Run / AI Studio preview) and as a **native Electron PC desktop application** on Windows, macOS, and Linux.

---

## 🚀 How to Run GhostOS as PC Desktop App

### 1. Prerequisite
Ensure you have **Node.js (v18 or v20+)** installed on your computer.

### 2. Local Setup
1. Clone or export this repository to your local computer.
2. Open terminal/command prompt in the project folder and install dependencies:
   ```bash
   npm install
   ```

### 3. Launch Hybrid Desktop App Mode
Run the unified dev server + Electron launcher command:
```bash
# Terminal 1: Start GhostOS local server
npm run dev

# Terminal 2: Launch Electron Native Desktop Window
npx electron electron/main.cjs
```
Alternatively, run the bundled script:
```bash
npm run electron:start
```

---

## 🛠️ Native Desktop Features Included

1. **System Tray Companion:**
   - Minimizes to Windows / macOS system tray.
   - Right-click tray menu for quick OBS overlay links, AI co-host triggers, and wheel spin controls.

2. **Global System Hotkeys:**
   - `Ctrl+Alt+S`: Instant scene switch in OBS.
   - `Ctrl+Alt+R`: Trigger AI Chat Roast co-host.

3. **Database & Full Backup Restore:**
   - Complete backup (`.json`) includes all linked Twitch/Kick/Discord accounts, audio ducking thresholds, hotkey maps, and local database state.

4. **Local LLM & Offline AI Support (Ollama & LM Studio):**
   - Run AI Co-Host & Roasts directly on local PC GPUs using Ollama or LM Studio.
   - Default Ollama Endpoint: `http://localhost:11434` (Supports `llama3`, `mistral`, `gemma2`, `deepseek-r1`).
   - Default LM Studio Endpoint: `http://localhost:1234/v1`.
   - Automatic zero-downtime fallback to Gemini Cloud API if local server is unready.

5. **OBS Studio Browser Sources:**
   - Pre-configured standalone overlay routes:
     - `http://localhost:3000/#overlay-chat` (Live Chat Overlay)
     - `http://localhost:3000/#overlay-wheel` (Wheel of Fortune Overlay)
     - `http://localhost:3000/#overlay-ai` (AI Co-Host Overlay)
     - `http://localhost:3000/#overlay-alerts` (Stream Alerts)

---

## 📦 Building Standalone Installer (.exe / .dmg)

To package GhostOS into a native Windows `.exe` installer or macOS `.dmg`:

```bash
# Install electron-builder (optional for packaging)
npm install --save-dev electron-builder

# Build standalone distribution executable
npm run build
npx electron-builder
```
The output executable installer will be generated in the `dist/` directory!
