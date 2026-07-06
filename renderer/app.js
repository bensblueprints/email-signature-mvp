/* Email Signature Studio — renderer logic */
'use strict';
/* global SignatureEngine */

const E = SignatureEngine;

// ------------------------------------------------------------------ state

const blankProfile = () => ({
  id: 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  label: 'New profile',
  name: '', title: '', company: '', phone: '', phone2: '', email: '',
  website: '', address: '',
  photo: '', photoUrl: '',
  socials: {},
  banner: '', bannerUrl: '', bannerLink: '',
  ctaText: '', ctaUrl: '', ctaColor: '#2563EB',
  disclaimer: '',
  templateId: 'classic',
  accentColor: '#2563EB',
  iconStyle: 'color'
});

let profiles = [];
let current = null;

// ------------------------------------------------------------------- DOM

const $ = (id) => document.getElementById(id);
const profileSelect = $('profileSelect');
const previewFrame = $('previewFrame');
const statusLine = $('statusLine');

const TEXT_FIELDS = ['name', 'title', 'company', 'phone', 'phone2', 'email',
  'website', 'address', 'photoUrl', 'bannerUrl', 'bannerLink', 'ctaText', 'ctaUrl', 'disclaimer'];

let statusTimer = null;
function status(msg) {
  statusLine.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { statusLine.textContent = ''; }, 3500);
}

// ------------------------------------------------------------ persistence

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => window.api.saveProfiles(profiles), 400);
}

// --------------------------------------------------------------- profiles

function refreshProfileSelect() {
  profileSelect.innerHTML = '';
  profiles.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label || p.name || 'Untitled';
    if (current && p.id === current.id) opt.selected = true;
    profileSelect.appendChild(opt);
  });
}

function setCurrent(profile) {
  current = profile;
  loadFormFromProfile();
  refreshProfileSelect();
  renderPreview();
}

function loadFormFromProfile() {
  TEXT_FIELDS.forEach((f) => { const el = $('f_' + f); if (el) el.value = current[f] || ''; });
  $('f_ctaColor').value = current.ctaColor || '#2563EB';
  $('f_accentColor').value = current.accentColor || '#2563EB';
  $('f_iconStyle').value = current.iconStyle || 'color';
  E.SOCIAL_NETWORKS.forEach((n) => {
    const el = $('f_social_' + n.id);
    if (el) el.value = (current.socials && current.socials[n.id]) || '';
  });
  updateThumb('photo');
  updateThumb('banner');
  highlightTemplate();
}

// ----------------------------------------------------------------- images

function resizeImage(file, maxDim, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      // JPEG for photos keeps signature size sane; keep PNG if transparent-ish source.
      const isPng = /png|gif|webp/i.test(file.type);
      cb(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.85));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function updateThumb(kind) {
  const thumb = $(kind + 'Thumb');
  const hint = $(kind + 'Hint');
  const clear = $(kind === 'photo' ? 'btnClearPhoto' : 'btnClearBanner');
  const src = current[kind] || '';
  thumb.classList.toggle('hidden', !src);
  hint.classList.toggle('hidden', !!src);
  clear.classList.toggle('hidden', !src);
  if (src) thumb.src = src;
}

function wireDropzone(zoneId, fileId, kind, maxDim) {
  const zone = $(zoneId);
  const input = $(fileId);
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { if (input.files[0]) handle(input.files[0]); input.value = ''; });
  ['dragover', 'dragenter'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('dragover'); }));
  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && /^image\//.test(file.type)) handle(file);
  });
  function handle(file) {
    resizeImage(file, maxDim, (dataUrl) => {
      current[kind] = dataUrl;
      updateThumb(kind);
      renderPreview();
      scheduleSave();
    });
  }
}

// -------------------------------------------------------------- templates

function buildTemplateGrid() {
  const grid = $('templateGrid');
  grid.innerHTML = '';
  E.TEMPLATE_IDS.forEach((id) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.tpl = id;
    btn.textContent = E.TEMPLATES[id].name;
    btn.addEventListener('click', () => {
      current.templateId = id;
      highlightTemplate();
      renderPreview();
      scheduleSave();
    });
    grid.appendChild(btn);
  });
}

function highlightTemplate() {
  document.querySelectorAll('#templateGrid button').forEach((b) => {
    b.classList.toggle('active', b.dataset.tpl === current.templateId);
  });
}

function buildSocialFields() {
  const wrap = $('socialFields');
  wrap.innerHTML = '';
  E.SOCIAL_NETWORKS.forEach((n) => {
    const row = document.createElement('div');
    row.className = 'social-field';
    const badge = document.createElement('span');
    badge.className = 'social-badge';
    badge.style.backgroundColor = n.color;
    badge.textContent = n.glyph;
    badge.title = n.label;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'f_social_' + n.id;
    input.placeholder = n.label + ' URL';
    input.addEventListener('input', () => {
      current.socials = current.socials || {};
      const v = input.value.trim();
      if (v) current.socials[n.id] = v; else delete current.socials[n.id];
      renderPreview();
      scheduleSave();
    });
    row.appendChild(badge);
    row.appendChild(input);
    wrap.appendChild(row);
  });
}

// ---------------------------------------------------------------- preview

let previewBg = 'light';

function signatureHtml() {
  return E.generateSignature(current, current.templateId, {
    accentColor: current.accentColor,
    iconStyle: current.iconStyle,
    textColor: previewBg === 'dark' ? '#E5E7EB' : '#1F2937',
    mutedColor: previewBg === 'dark' ? '#9CA3AF' : '#6B7280'
  });
}

/** Export always uses light-mode text colors (email default). */
function exportHtml() {
  return E.generateSignature(current, current.templateId, {
    accentColor: current.accentColor,
    iconStyle: current.iconStyle
  });
}

let previewTimer = null;
function renderPreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    const bg = previewBg === 'dark' ? '#111827' : '#ffffff';
    previewFrame.srcdoc =
      '<!DOCTYPE html><html><body style="margin:0;padding:28px;background:' + bg + ';">' +
      '<p style="font-family:Arial,sans-serif;font-size:13px;color:' + (previewBg === 'dark' ? '#9CA3AF' : '#6B7280') + ';">Best,</p>' +
      signatureHtml() +
      '</body></html>';
  }, 120);
}

// ---------------------------------------------------------------- exports

function plainText() {
  const p = current;
  return [p.name, [p.title, p.company].filter(Boolean).join(', '), p.phone, p.email, p.website]
    .filter(Boolean).join('\n');
}

async function copyRich() {
  await window.api.copyHtml(exportHtml(), plainText());
  status('Signature copied — paste straight into Gmail / Outlook signature settings.');
}

async function copySource() {
  await window.api.copyText(exportHtml());
  status('Raw HTML source copied to clipboard.');
}

async function saveHtml() {
  const doc = E.generateDocument(current, current.templateId, { accentColor: current.accentColor, iconStyle: current.iconStyle });
  const file = await window.api.saveHtmlFile(E.safeFileName(current.name || current.label) + '-signature.html', doc);
  if (file) status('Saved ' + file);
}

async function batchExport() {
  if (!profiles.length) return;
  const files = profiles.map((p) => ({
    fileName: E.safeFileName(p.name || p.label) + '-signature.html',
    html: E.generateDocument(p, p.templateId || 'classic', { accentColor: p.accentColor, iconStyle: p.iconStyle })
  }));
  const res = await window.api.batchExport(files);
  if (res) status('Exported ' + res.count + ' signature files to ' + res.dir);
}

async function importCsv() {
  const text = await window.api.openCsv();
  if (!text) return;
  const imported = E.csvToProfiles(text);
  if (!imported.length) { status('No rows found — first row must be headers (name, email, title, …).'); return; }
  imported.forEach((p) => {
    const prof = Object.assign(blankProfile(), p);
    prof.label = p.name || p.email;
    prof.templateId = current ? current.templateId : 'classic';
    prof.accentColor = current ? current.accentColor : '#2563EB';
    prof.iconStyle = current ? current.iconStyle : 'color';
    profiles.push(prof);
  });
  refreshProfileSelect();
  scheduleSave();
  status('Imported ' + imported.length + ' team member' + (imported.length === 1 ? '' : 's') +
    ' using the "' + E.TEMPLATES[current.templateId].name + '" template. Use 📦 Export All to generate the files.');
}

// ------------------------------------------------------------ install guides

const GUIDES = {
  'Gmail': `
    <ol>
      <li>In the app, click <code>📋 Copy for Gmail / Outlook</code>.</li>
      <li>Open Gmail → ⚙ <strong>Settings</strong> → <strong>See all settings</strong> → <strong>General</strong> tab.</li>
      <li>Scroll to <strong>Signature</strong> → <strong>Create new</strong>, name it.</li>
      <li>Click inside the signature box and press <code>Ctrl+V</code> — the formatted signature pastes in.</li>
      <li>Under <strong>Signature defaults</strong>, pick it for new emails and replies.</li>
      <li>Scroll down and <strong>Save Changes</strong>.</li>
    </ol>
    <div class="tip">Tip: if your headshot was embedded as base64 and doesn't show in Gmail's editor, switch to a hosted image URL in the Headshot section — Gmail sometimes strips embedded images on paste.</div>`,
  'Outlook (desktop)': `
    <ol>
      <li>Click <code>💾 Save .html</code> and save the file anywhere.</li>
      <li>Open the saved file in your browser, press <code>Ctrl+A</code> then <code>Ctrl+C</code>.</li>
      <li>In Outlook: <strong>File → Options → Mail → Signatures…</strong></li>
      <li>Click <strong>New</strong>, name it, click in the edit box and press <code>Ctrl+V</code>.</li>
      <li>Set it as default for New messages and Replies/forwards → <strong>OK</strong>.</li>
    </ol>
    <div class="tip">Power move: you can also drop the saved .html directly into <code>%APPDATA%\\Microsoft\\Signatures\\</code> and it appears in Outlook's signature picker.</div>`,
  'Outlook (web)': `
    <ol>
      <li>Click <code>📋 Copy for Gmail / Outlook</code> in the app.</li>
      <li>Go to outlook.com / Outlook 365 → ⚙ <strong>Settings</strong> → <strong>Mail</strong> → <strong>Compose and reply</strong>.</li>
      <li>Under <strong>Email signature</strong>, click in the editor and press <code>Ctrl+V</code>.</li>
      <li>Choose defaults for new messages and replies → <strong>Save</strong>.</li>
    </ol>`,
  'Apple Mail': `
    <ol>
      <li>Click <code>💾 Save .html</code>, open the file in Safari, press <code>⌘A</code> then <code>⌘C</code>.</li>
      <li>Mail → <strong>Settings → Signatures</strong>, pick your account, click <strong>+</strong>.</li>
      <li>Delete the placeholder text, press <code>⌘V</code> to paste.</li>
      <li>Untick <em>"Always match my default message font"</em> so the styling is kept.</li>
      <li>Drag the signature onto your account and set it as default.</li>
    </ol>`,
  'Thunderbird': `
    <ol>
      <li>Click <code>💾 Save .html</code> and save the file somewhere permanent (e.g. Documents).</li>
      <li>Thunderbird → ☰ → <strong>Account Settings</strong> → select your account.</li>
      <li>Tick <strong>"Attach the signature from a file instead"</strong>.</li>
      <li>Click <strong>Choose…</strong> and select the saved .html file.</li>
      <li>Done — Thunderbird reads the file on every send, so re-saving from this app updates it automatically.</li>
    </ol>`
};

function buildGuides() {
  const tabs = $('guideTabs');
  const body = $('guideBody');
  tabs.innerHTML = '';
  Object.keys(GUIDES).forEach((name, i) => {
    const btn = document.createElement('button');
    btn.textContent = name;
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      body.innerHTML = GUIDES[name];
    });
    tabs.appendChild(btn);
  });
  body.innerHTML = GUIDES['Gmail'];
}

// ------------------------------------------------------------------ wiring

function wire() {
  // form fields
  TEXT_FIELDS.forEach((f) => {
    const el = $('f_' + f);
    if (!el) return;
    el.addEventListener('input', () => {
      current[f] = el.value;
      if (f === 'name' && (!current.label || current.label === 'New profile')) {
        current.label = el.value;
        refreshProfileSelect();
      }
      renderPreview();
      scheduleSave();
    });
  });
  $('f_ctaColor').addEventListener('input', (e) => { current.ctaColor = e.target.value; renderPreview(); scheduleSave(); });
  $('f_accentColor').addEventListener('input', (e) => { current.accentColor = e.target.value; renderPreview(); scheduleSave(); });
  $('f_iconStyle').addEventListener('change', (e) => { current.iconStyle = e.target.value; renderPreview(); scheduleSave(); });

  // profiles
  profileSelect.addEventListener('change', () => {
    const p = profiles.find((x) => x.id === profileSelect.value);
    if (p) setCurrent(p);
  });
  $('btnNewProfile').addEventListener('click', () => {
    const p = blankProfile();
    profiles.push(p);
    setCurrent(p);
    scheduleSave();
  });
  $('btnDuplicate').addEventListener('click', () => {
    const copy = JSON.parse(JSON.stringify(current));
    copy.id = blankProfile().id;
    copy.label = (current.label || current.name || 'Profile') + ' (copy)';
    profiles.push(copy);
    setCurrent(copy);
    scheduleSave();
  });
  $('btnDelete').addEventListener('click', () => {
    if (profiles.length <= 1) { status('Keep at least one profile.'); return; }
    profiles = profiles.filter((p) => p.id !== current.id);
    setCurrent(profiles[0]);
    scheduleSave();
  });

  // preview toggles
  $('widthToggle').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('#widthToggle button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    previewFrame.classList.toggle('mobile', btn.dataset.w === 'mobile');
  });
  $('bgToggle').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('#bgToggle button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    previewBg = btn.dataset.bg;
    renderPreview();
  });

  // exports
  $('btnCopyRich').addEventListener('click', copyRich);
  $('btnCopySource').addEventListener('click', copySource);
  $('btnSaveHtml').addEventListener('click', saveHtml);
  $('btnBatchExport').addEventListener('click', batchExport);
  $('btnImportCsv').addEventListener('click', importCsv);

  // images
  wireDropzone('photoDrop', 'photoFile', 'photo', 240);
  wireDropzone('bannerDrop', 'bannerFile', 'banner', 800);
  $('btnClearPhoto').addEventListener('click', () => { current.photo = ''; updateThumb('photo'); renderPreview(); scheduleSave(); });
  $('btnClearBanner').addEventListener('click', () => { current.banner = ''; updateThumb('banner'); renderPreview(); scheduleSave(); });

  // guides modal
  $('btnGuides').addEventListener('click', () => $('guidesModal').classList.remove('hidden'));
  $('btnCloseGuides').addEventListener('click', () => $('guidesModal').classList.add('hidden'));
  $('guidesModal').addEventListener('click', (e) => { if (e.target === $('guidesModal')) $('guidesModal').classList.add('hidden'); });
}

// -------------------------------------------------------------------- init

(async function init() {
  buildTemplateGrid();
  buildSocialFields();
  buildGuides();
  wire();
  profiles = await window.api.loadProfiles();
  if (!profiles.length) {
    const demo = blankProfile();
    demo.label = 'My signature';
    demo.name = 'Jane Cooper';
    demo.title = 'Head of Growth';
    demo.company = 'Acme Inc.';
    demo.phone = '+1 555 010 0100';
    demo.email = 'jane@acme.com';
    demo.website = 'acme.com';
    demo.socials = { linkedin: 'https://linkedin.com/in/janecooper', twitter: 'https://x.com/janecooper' };
    profiles = [demo];
  }
  setCurrent(profiles[0]);
})();
