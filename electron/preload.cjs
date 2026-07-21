const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getDesktopInfo: () => ipcRenderer.invoke('get-desktop-info'),
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  relaunchApp: () => ipcRenderer.send('relaunch-app'),
  onTrigger: (callback) => {
    ipcRenderer.on('electron-trigger', (event, data) => callback(data));
  },
  onHotkey: (callback) => {
    ipcRenderer.on('electron-hotkey', (event, data) => callback(data));
  },
});
