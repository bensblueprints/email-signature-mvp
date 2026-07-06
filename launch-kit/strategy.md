# Launch Strategy — Email Signature Studio

## Target communities

| Community | Angle (rules-aware) |
|---|---|
| r/agency | "How we automated client signature rollouts" — value post about the CSV batch workflow; mention tool only when asked or in comments. No naked link drops. |
| r/msp | MSPs deploy signatures for dozens of client orgs. Post as a workflow write-up ("signature deployment without Exchange transport rule pain"); tool in context. |
| r/smallbusiness | Cost-cutting angle: "audit your $5–10/mo tools — here's the subscription math on signatures." Follows the no-self-promo-in-title rule; disclose you built it. |
| r/sysadmin | Read-the-room sub: only respond in existing "signature management" threads; lead with the MIT repo (free), never the paid link. |
| r/Emailmarketing & r/gmail | Answer recurring "how do I make a nice Gmail signature" questions with genuinely useful steps + link to the free repo. |
| Indie Hackers | Build-in-public post: "Replacing a $6/mo SaaS with a $15 one-time desktop app — the math and the launch." |

## Hacker News — Show HN draft

**Title:** Show HN: Email Signature Studio – local desktop alternative to signature SaaS

**Post:**
I kept seeing teams pay $6/user/month for email signature generators, where the entire deliverable is a table-based HTML block that changes maybe twice a year.

So I built a desktop app (Electron, MIT) that does it locally: 10 templates hand-written in email-safe HTML — tables, inline styles, VML conditional comments so the CTA button survives Outlook — with a live preview, rich-clipboard copy that pastes straight into Gmail's settings, and a CSV team mode that batch-exports a folder of signatures for a whole org.

Interesting bits:
- The social icons are colored HTML table cells with glyphs, not images — zero external requests, nothing to host, and they can't render as broken-image squares.
- Rich clipboard write (HTML flavor) via Electron's clipboard API is what makes "paste into Gmail" work; plain text copy does not.
- The smoke test renders every template through the real engine and asserts no `<link>`, no `<style>` blocks, table layout present — the failure modes that get signatures mangled.

Source: github.com/bensblueprints (MIT). I sell a packaged 1-click installer for $15 one-time; the code is free. Happy to talk email-client rendering horror stories.

## SEO keywords (10)

1. wisestamp alternative
2. email signature generator no subscription
3. html email signature generator
4. email signature software one time purchase
5. bulk email signature generator
6. team email signature generator csv
7. gmail signature generator free
8. outlook html signature creator
9. email signature manager for agencies
10. offline email signature maker

## AppSumo / PitchGround pitch

Email Signature Studio turns the recurring cost of signature SaaS into a one-time purchase your buyers actually love. It's a local desktop app that generates polished, email-safe HTML signatures (10 templates, tables + inline styles, Outlook-proof buttons) with a killer team feature: import a CSV of employees and batch-export ready-to-install signatures for the entire company — the exact workflow agencies and MSPs currently pay WiseStamp Teams for at $4–6/seat/month. No account, no cloud, no vendor branding, MIT source for trust. LTD buyers get a tool with obvious perpetual value, a clear anchor competitor, and zero ongoing infrastructure cost for us — margins stay clean at any volume.

## Pricing

**Suggested: $15 one-time.**

Math vs WiseStamp Pro ($6/mo/user):
- Solo user: pays for itself in **2.5 months**.
- 5-person team (WiseStamp = $30/mo): pays for itself in **2 weeks**; saves $1,065 over 3 years.
- Agency doing one 20-seat client rollout: replaces **$120/mo** of client seat fees on day one.

Positioning line: "WiseStamp rents you a signature for $6 a month. This one's yours for $15, forever."
