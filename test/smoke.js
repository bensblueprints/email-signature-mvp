/* Smoke test — exercises the real signature engine, CSV batch export, and
 * profile store round-trip. Run with `npm test`. */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const E = require('../src/engine');
const store = require('../src/store');

const OUT = path.join(__dirname, 'output');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let passed = 0;
function ok(cond, label) {
  assert.ok(cond, label);
  passed++;
  console.log('  ✓ ' + label);
}

// ------------------------------------------------------------- fixture

const fixture = {
  name: 'Jane Cooper',
  title: 'Head of Growth',
  company: 'Acme Inc.',
  phone: '+1 555 010 0100',
  phone2: '+1 555 010 0200',
  email: 'jane@acme.com',
  website: 'https://acme.com',
  address: '100 Main St, Austin TX',
  // tiny real 1x1 PNG as the uploaded/embedded headshot
  photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  socials: {
    linkedin: 'https://linkedin.com/in/janecooper',
    twitter: 'https://x.com/janecooper',
    github: 'https://github.com/janecooper'
  },
  ctaText: 'Book a call',
  ctaUrl: 'https://cal.com/jane',
  ctaColor: '#16A34A',
  disclaimer: 'This email is confidential & <intended> for the addressee only.'
};

// ------------------------------------ 1. template engine, all 10 templates

console.log('\n[1] Template engine — all templates');
assert.strictEqual(E.TEMPLATE_IDS.length, 10, 'exactly 10 templates registered');
passed++;
console.log('  ✓ 10 templates registered: ' + E.TEMPLATE_IDS.join(', '));

for (const id of E.TEMPLATE_IDS) {
  const html = E.generateSignature(fixture, id, { accentColor: '#7C3AED', iconStyle: 'color' });

  ok(html.includes('Jane Cooper'), id + ': contains name');
  ok(html.includes('Head of Growth'), id + ': contains title');
  ok(html.includes('Acme Inc.'), id + ': contains company');
  ok(html.includes('jane@acme.com') && html.includes('mailto:jane@acme.com'), id + ': email + mailto link');
  ok(html.includes('+1 555 010 0100') && html.includes('tel:+15550100100'), id + ': phone + tel link');
  ok(html.includes('acme.com'), id + ': website');
  ok(/<table[^>]*cellpadding="0"/.test(html), id + ': uses table layout');
  ok(!/<link\b/i.test(html), id + ': no <link> tags');
  ok(!/<style\b/i.test(html), id + ': no <style> blocks / external stylesheets');
  ok(/style="/.test(html), id + ': inline styles present');
  ok(html.includes('linkedin.com/in/janecooper'), id + ': social link rendered');
  ok(html.includes('&lt;intended&gt;'), id + ': disclaimer HTML-escaped');
  ok(!/\bclass="/.test(html), id + ': no CSS classes (inline-only)');
}

// mono icon style + CTA + full document
const mono = E.generateSignature(fixture, 'classic', { iconStyle: 'mono' });
ok(mono.includes('#4B5563'), 'mono icon style uses neutral color');
ok(mono.includes('Book a call') && mono.includes('cal.com/jane'), 'CTA button rendered');
ok(mono.includes('<!--[if mso]>'), 'Outlook conditional comment present for CTA');

const doc = E.generateDocument(fixture, 'card');
ok(doc.startsWith('<!DOCTYPE html>'), 'generateDocument produces standalone HTML doc');
ok(!/<link\b/i.test(doc), 'document has no external stylesheet');
fs.writeFileSync(path.join(OUT, 'sample-signature.html'), doc, 'utf8');

// ------------------------------------------------ 2. CSV → batch of files

console.log('\n[2] CSV import → batch export');
const csv = [
  'name,title,company,email,phone,website,linkedin,twitter',
  'Jane Cooper,Head of Growth,Acme Inc.,jane@acme.com,+1 555 010 0100,acme.com,https://linkedin.com/in/janecooper,',
  '"Smith, Bob",Engineer,Acme Inc.,bob@acme.com,+1 555 010 0300,,,https://x.com/bobsmith',
  'Ada Lovelace,CTO,Acme Inc.,ada@acme.com,+1 555 010 0400,acme.com,https://linkedin.com/in/ada,'
].join('\n');

const people = E.csvToProfiles(csv);
ok(people.length === 3, 'CSV parsed 3 team members');
ok(people[1].name === 'Smith, Bob', 'quoted CSV field with comma parsed correctly');
ok(people[0].socials.linkedin === 'https://linkedin.com/in/janecooper', 'social column mapped to socials');

const batchDir = path.join(OUT, 'batch');
fs.mkdirSync(batchDir, { recursive: true });
for (const p of people) {
  const html = E.generateDocument(p, 'modern-sidebar', { accentColor: '#2563EB' });
  fs.writeFileSync(path.join(batchDir, E.safeFileName(p.name) + '-signature.html'), html, 'utf8');
}
const files = fs.readdirSync(batchDir).filter((f) => f.endsWith('.html'));
ok(files.length === 3, 'batch export wrote 3 .html files');
for (const f of files) {
  const content = fs.readFileSync(path.join(batchDir, f), 'utf8');
  ok(content.includes('<table') && !/<link\b/i.test(content), f + ' is valid table-based signature');
}
const bobHtml = fs.readFileSync(path.join(batchDir, 'smith-bob-signature.html'), 'utf8');
ok(bobHtml.includes('bob@acme.com') && bobHtml.includes('x.com/bobsmith'), 'per-person data lands in the right file');

// -------------------------------------------- 3. profile store round-trip

console.log('\n[3] Profile store round-trip');
const storePath = path.join(OUT, 'profiles.json');
const savedProfiles = [
  Object.assign({ id: 'p1', label: 'Jane', templateId: 'card', accentColor: '#16A34A' }, fixture),
  { id: 'p2', label: 'Bob', name: 'Bob Smith', email: 'bob@acme.com', templateId: 'minimal', socials: {} }
];
store.saveProfiles(storePath, savedProfiles);
ok(fs.existsSync(storePath), 'profiles.json written');
const loaded = store.loadProfiles(storePath);
assert.deepStrictEqual(loaded, savedProfiles, 'round-trip equality');
passed++;
console.log('  ✓ loaded profiles deep-equal saved profiles');
ok(loaded[0].socials.github === 'https://github.com/janecooper', 'nested socials survive round-trip');
ok(loaded[0].photo.startsWith('data:image/png;base64,'), 'embedded base64 photo survives round-trip');

// corrupt store recovers to []
fs.writeFileSync(storePath, '{not json', 'utf8');
const recovered = store.loadProfiles(storePath);
ok(Array.isArray(recovered) && recovered.length === 0, 'corrupt store recovers to empty list (with .bak)');

console.log('\nAll smoke tests passed (' + passed + ' assertions).');
console.log('Sample outputs in ' + OUT);
