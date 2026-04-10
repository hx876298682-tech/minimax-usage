const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  apiKeySaved: () => ipcRenderer.send('api-key-saved'),
  showInputWindow: () => ipcRenderer.send('show-input-window'),
  moveWindow: (x, y) => ipcRenderer.send('move-window', x, y),
  closeWindow: () => ipcRenderer.send('hide-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  hideWindow: () => ipcRenderer.send('hide-window'),
  showWindow: () => ipcRenderer.send('show-window'),
  quitApp: () => ipcRenderer.send('quit-app'),
  setAutoLaunch: (enable) => ipcRenderer.send('set-auto-launch', enable),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
});
