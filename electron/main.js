const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    icon: __dirname + '/icon.ico',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.setMenuBarVisibility(false);
  win.loadURL('https://distribuidoraeinverisones1.netlify.app');
});
