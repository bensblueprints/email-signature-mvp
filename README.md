# ✒️ Email Signature Studio

## Demo



https://github.com/user-attachments/assets/51e6430c-4e93-47ee-8b52-9723748a45bb



[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Professional email signatures for your whole team — on your desktop, forever.**
The one-time-purchase alternative to WiseStamp's $6/month subscription. No accounts, no branding injected into *your* signature, no cloud. Pay once. Own it forever.

![Screenshot](docs/screenshot.png)

## Why

WiseStamp charges **$6/mo per user** ($72/yr, forever) to generate what is, at the end of the day, a block of HTML — and the free tier stamps *their* ad into *your* signature. Email Signature Studio does the same job locally, for every team member you'll ever have, with zero recurring cost and zero telemetry.

## Features

- **10 polished templates** — Classic, Modern Sidebar, Minimal, Bold Accent Bar, Card, Compact, Corporate, Creative, Photo Left, Photo Top
- **Email-safe HTML** — table layouts, 100% inline styles, Outlook (VML) conditional comments for the CTA button, no `<link>`/external CSS, no web fonts. Renders correctly in Gmail, Outlook desktop & web, Apple Mail, Thunderbird
- **Full editor** — name, title, company, two phones, email, website, address, disclaimer text
- **Headshot / logo upload** — drag & drop, auto-resized and embedded as base64, or use a hosted image URL for maximum client compatibility
- **12 social networks** — LinkedIn, X, Facebook, Instagram, YouTube, TikTok, GitHub, Dribbble, Behance, Pinterest, WhatsApp, Telegram — brand-colored or monochrome badge style (pure HTML badges: no broken-image icons, no external requests)
- **Banner + CTA button** — optional promo banner image with click-through link and a bulletproof colored CTA button
- **Live preview** — desktop/mobile width toggle, light/dark background toggle
- **Export anywhere** — one-click *rich* copy (paste straight into Gmail's signature box), raw HTML source copy, save as `.html`
- **In-app install guides** — step-by-step for Gmail, Outlook desktop, Outlook web, Apple Mail, Thunderbird
- **Multiple profiles** — one per team member, duplicate, autosaved to local JSON
- **Team mode** — import a CSV of people, generate signatures for everyone with your chosen template, batch-export a folder of `.html` files
- **100% local** — no network calls, no telemetry, your data never leaves the machine

## Quick start

```bash
npm i
npm start
```

`npm test` runs the smoke suite (renders every template through the real engine, CSV→batch export, profile store round-trip).

`npm run dist` builds a Windows NSIS installer via electron-builder.

## ☕ Skip the setup — get the 1-click installer

Don't want to touch Node? Grab the packaged installer (and support development):

**→ [https://whop.com/benjisaiempire/sigcraft](https://whop.com/benjisaiempire/sigcraft)**

## vs WiseStamp

| | **Email Signature Studio** | WiseStamp Pro |
|---|---|---|
| Price | **$15 once** | $6/mo/user, forever |
| 1 user, 3 years | **$15** | $216 |
| 5-person team, 3 years | **$15** | $1,080 |
| Their branding in your signature | Never | On free tier |
| Works offline / air-gapped | ✅ | ❌ |
| Your data stays local | ✅ | ❌ (cloud account) |
| Templates | 10 | ~50 |
| Team CSV batch generation | ✅ | Higher "Teams" tier |
| Source code | MIT, yours | Closed |

## Team CSV format

First row = headers. Recognized (case-insensitive): `name, title, company, phone, phone2, email, website, address, photoUrl, disclaimer, ctaText, ctaUrl` plus one column per social network id (`linkedin, twitter, facebook, instagram, youtube, tiktok, github, dribbble, behance, pinterest, whatsapp, telegram`).

```csv
name,title,email,phone,linkedin
Jane Cooper,Head of Growth,jane@acme.com,+1 555 010 0100,https://linkedin.com/in/janecooper
Bob Smith,Engineer,bob@acme.com,+1 555 010 0300,
```

Import → pick your template → **📦 Export All** → a folder of ready-to-install `.html` signatures.

## Tech stack

- **Electron** (main + preload + renderer, context-isolated)
- Plain HTML/CSS/JS renderer — zero runtime dependencies
- Pure, dependency-free signature engine (`src/engine.js`) shared by the app and the test suite
- `electron-builder` NSIS packaging

## Notes on email-client quirks

- **Embedded base64 images**: Gmail's signature editor sometimes strips pasted base64 images. If your headshot disappears, use the *hosted image URL* field instead — that's also what keeps signature bytes small for recipients.
- **Social icons** are colored HTML badge cells (not images), so they can never appear as broken images and require no hosting.

## License

MIT © 2026 Ben (bensblueprints)

## macOS build

See [MAC-BUILD.md](MAC-BUILD.md). Quickest path: GitHub **Actions** tab -> run the **Mac Build** (`mac-build.yml`) workflow to get a downloadable `.dmg` (unsigned - right-click -> Open on first launch).
