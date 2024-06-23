const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

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

ipcMain.handle('select-folder', async (event) => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.filePaths[0];
});

ipcMain.handle('organize-files', async (event, options) => {
  const { sourceDir, destDir, fileTypes, minSize, maxSize, dateFrom, dateTo } = options;
  
  const files = fs.readdirSync(sourceDir);
  let organizedFiles = 0;

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase().substring(1);
      if (fileTypes.includes(ext)) {
        const size = stats.size / 1024; // Convert to KB
        const creationTime = stats.birthtime;

        if (size >= minSize && size <= maxSize &&
            (!dateFrom || creationTime >= new Date(dateFrom)) &&
            (!dateTo || creationTime <= new Date(dateTo))) {
          const destFilePath = path.join(destDir, file);
          fs.renameSync(filePath, destFilePath);
          organizedFiles++;
        }
      }
    }
  }

  return { totalFiles: files.length, organizedFiles };
});
