'use strict';
const { app, BrowserWindow, ipcMain, dialog, clipboard, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const store = require('./src/store');

let win = null;
const profilesPath = () => path.join(app.getPath('userData'), 'profiles.json');

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1000,
    minHeight: 640,
    backgroundColor: '#0B0F17',
    autoHideMenuBar: true,
    title: 'Email Signature Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  // Open external links in the default browser, never in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ------------------------------------------------------------------- IPC

ipcMain.handle('profiles:load', () => store.loadProfiles(profilesPath()));

ipcMain.handle('profiles:save', (_e, profiles) => {
  store.saveProfiles(profilesPath(), profiles);
  return true;
});

// Rich HTML clipboard write — pasting into Gmail keeps the rendered signature.
ipcMain.handle('clipboard:writeHtml', (_e, { html, text }) => {
  clipboard.write({ html, text: text || '' });
  return true;
});

ipcMain.handle('clipboard:writeText', (_e, text) => {
  clipboard.writeText(String(text || ''));
  return true;
});

ipcMain.handle('file:saveHtml', async (_e, { suggestedName, html }) => {
  const res = await dialog.showSaveDialog(win, {
    title: 'Save signature as HTML',
    defaultPath: suggestedName || 'signature.html',
    filters: [{ name: 'HTML', extensions: ['html'] }]
  });
  if (res.canceled || !res.filePath) return null;
  fs.writeFileSync(res.filePath, html, 'utf8');
  return res.filePath;
});

// Batch export: [{ fileName, html }] → chosen folder.
ipcMain.handle('file:batchExport', async (_e, files) => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Choose export folder',
    properties: ['openDirectory', 'createDirectory']
  });
  if (res.canceled || !res.filePaths.length) return null;
  const dir = res.filePaths[0];
  const written = [];
  const used = new Set();
  for (const f of files) {
    let name = f.fileName.replace(/[^a-z0-9_\-. ]/gi, '') || 'signature.html';
    let candidate = name;
    let n = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = name.replace(/\.html$/i, '') + '-' + n++ + '.html';
    }
    used.add(candidate.toLowerCase());
    const full = path.join(dir, candidate);
    fs.writeFileSync(full, f.html, 'utf8');
    written.push(full);
  }
  return { dir, count: written.length };
});

ipcMain.handle('file:openCsv', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Import team CSV',
    filters: [{ name: 'CSV', extensions: ['csv', 'txt'] }],
    properties: ['openFile']
  });
  if (res.canceled || !res.filePaths.length) return null;
  return fs.readFileSync(res.filePaths[0], 'utf8');
});

ipcMain.handle('shell:openExternal', (_e, url) => {
  if (/^https?:\/\//i.test(String(url))) shell.openExternal(url);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
