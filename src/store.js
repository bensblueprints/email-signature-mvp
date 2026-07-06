/* Profile persistence — plain JSON file store. Used by Electron main and tests. */
'use strict';
const fs = require('fs');
const path = require('path');

function loadProfiles(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(data.profiles) ? data.profiles : [];
  } catch (err) {
    // Corrupt store: back it up rather than destroying user data.
    try { fs.copyFileSync(filePath, filePath + '.bak-' + Date.now()); } catch (_) {}
    return [];
  }
}

function saveProfiles(filePath, profiles) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ version: 1, profiles: profiles }, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

module.exports = { loadProfiles, saveProfiles };
