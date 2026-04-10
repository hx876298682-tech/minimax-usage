const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let inputWindow = null;
let widgetWindow = null;
let tray = null;

const STORAGE_KEY = 'minimax_api_key';

function createInputWindow() {
  inputWindow = new BrowserWindow({
    width: 300,
    height: 50,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  inputWindow.loadFile('input.html');

  inputWindow.once('ready-to-show', () => {
    inputWindow.show();
  });

  inputWindow.on('close', (e) => {
    if (!app.isQuitting && inputWindow) {
      e.preventDefault();
      inputWindow.hide();
    }
  });
}

function createWidgetWindow() {
  widgetWindow = new BrowserWindow({
    width: 160,
    height: 160,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  widgetWindow.loadFile('widget.html');

  widgetWindow.once('ready-to-show', () => {
    widgetWindow.show();
  });

  widgetWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      widgetWindow.hide();
    }
  });

  widgetWindow.webContents.on('context-menu', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '编辑 API Key',
        click: () => {
          if (widgetWindow) widgetWindow.hide();
          if (!inputWindow) createInputWindow();
          inputWindow.show();
          inputWindow.focus();
        },
      },
      {
        label: '显示悬浮窗',
        click: () => {
          if (widgetWindow) widgetWindow.show();
        },
      },
      {
        label: '最小化到托盘',
        click: () => {
          if (widgetWindow) widgetWindow.hide();
        },
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);
    contextMenu.popup();
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }
  } catch (e) {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon.isEmpty() ? createDefaultIcon() : trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示悬浮窗',
      click: () => {
        if (widgetWindow) widgetWindow.show();
      },
    },
    {
      label: '隐藏悬浮窗',
      click: () => {
        if (widgetWindow) widgetWindow.hide();
      },
    },
    { type: 'separator' },
    {
      label: '开机自启动',
      type: 'checkbox',
      checked: store.get('autoLaunch', false),
      click: (menuItem) => {
        store.set('autoLaunch', menuItem.checked);
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked,
          path: app.getPath('exe'),
        });
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('MiniMax 用量监控');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (widgetWindow) {
      if (widgetWindow.isVisible()) {
        widgetWindow.hide();
      } else {
        widgetWindow.show();
      }
    }
  });
}

function createDefaultIcon() {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    canvas[i * 4] = 0xe5;
    canvas[i * 4 + 1] = 0x6b;
    canvas[i * 4 + 2] = 0x6f;
    canvas[i * 4 + 3] = 0xff;
  }

  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

ipcMain.on('api-key-saved', () => {
  if (inputWindow) {
    inputWindow.hide();
  }
  if (!widgetWindow) {
    createWidgetWindow();
  } else {
    widgetWindow.show();
  }
  if (tray) tray.setToolTip('MiniMax 用量监控');
});

ipcMain.on('show-input-window', () => {
  if (!inputWindow) createInputWindow();
  if (widgetWindow) widgetWindow.hide();
  inputWindow.show();
  inputWindow.focus();
});

ipcMain.on('move-window', (event, x, y) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const [currentX, currentY] = win.getPosition();
    win.setPosition(currentX + x, currentY + y);
  }
});

ipcMain.on('hide-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.hide();
});

ipcMain.on('show-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.show();
});

ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

ipcMain.on('set-auto-launch', (event, enable) => {
  store.set('autoLaunch', enable);
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe'),
  });
});

ipcMain.handle('get-auto-launch', () => {
  return store.get('autoLaunch', false);
});

app.whenReady().then(() => {
  if (store.get('autoLaunch', false)) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe'),
    });
  }

  const savedKey = store.get(STORAGE_KEY);

  if (savedKey) {
    createWidgetWindow();
  } else {
    createInputWindow();
  }

  createTray();
});

app.on('window-all-closed', () => {
  // Keep running in tray on Windows
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const savedKey = store.get(STORAGE_KEY);
    if (savedKey) {
      createWidgetWindow();
    } else {
      createInputWindow();
    }
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
