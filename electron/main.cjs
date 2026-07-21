const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: 'GhostOS Streaming Companion',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    backgroundColor: '#090d16',
    frame: true,
    show: false,
  });

  const appUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  mainWindow.loadURL(appUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    // Minimize to system tray if configured
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (tray) {
        tray.displayBalloon({
          title: 'GhostOS Running in System Tray',
          content: 'GhostOS is still active in the system background for OBS overlays and hotkeys.',
        });
      }
    }
  });
}

function createSystemTray() {
  const iconPath = path.join(__dirname, '../public/favicon.ico');
  try {
    tray = new Tray(iconPath);
  } catch (e) {
    console.log('Tray icon fallback used');
    return;
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open GhostOS Workspace',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Open OBS Overlay Generator',
      click: () => {
        shell.openExternal('http://localhost:3000/#overlay-chat');
      },
    },
    { type: 'separator' },
    {
      label: 'Toggle AI Co-Host',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('electron-trigger', 'toggle-ai');
        }
      },
    },
    {
      label: 'Spin Wheel of Fortune',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('electron-trigger', 'spin-wheel');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit GhostOS Desktop',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('GhostOS Streaming Companion (Hybrid Desktop)');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function registerGlobalHotkeys() {
  globalShortcut.register('Ctrl+Alt+S', () => {
    if (mainWindow) {
      mainWindow.webContents.send('electron-hotkey', 'scene-switch');
    }
  });

  globalShortcut.register('Ctrl+Alt+R', () => {
    if (mainWindow) {
      mainWindow.webContents.send('electron-hotkey', 'ai-roast');
    }
  });
}

app.whenReady().then(() => {
  createMainWindow();
  createSystemTray();
  registerGlobalHotkeys();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('get-desktop-info', () => {
  return {
    isElectron: true,
    platform: process.platform,
    version: app.getVersion(),
    arch: process.arch,
  };
});

ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('relaunch-app', () => {
  app.relaunch();
  app.exit();
});
