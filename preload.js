'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadProfiles: () => ipcRenderer.invoke('profiles:load'),
  saveProfiles: (profiles) => ipcRenderer.invoke('profiles:save', profiles),
  copyHtml: (html, text) => ipcRenderer.invoke('clipboard:writeHtml', { html, text }),
  copyText: (text) => ipcRenderer.invoke('clipboard:writeText', text),
  saveHtmlFile: (suggestedName, html) => ipcRenderer.invoke('file:saveHtml', { suggestedName, html }),
  batchExport: (files) => ipcRenderer.invoke('file:batchExport', files),
  openCsv: () => ipcRenderer.invoke('file:openCsv'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
});
