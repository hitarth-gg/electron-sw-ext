import { app, BrowserWindow } from 'electron';
import path from 'path';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
app.commandLine.appendSwitch('enable-logging');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  /* ------------------------------------------------------ */
  app.on('session-created', async (ses) => {
    try {
      const devtron = await ses.extensions.loadExtension(path.resolve('extension'), {
        allowFileAccess: true,
      });
      const serviceWorker = await ses.serviceWorkers.startWorkerForScope(devtron.url);
      serviceWorker.startTask();
    } catch (error) {
      console.error('Failed to load Devtron:', error);
    }
  });
  /* ------------------------------------------------------ */

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
