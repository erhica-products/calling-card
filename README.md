# Calling Card — Backend

A small, dependency-light backend foundation for a **digital calling card**.
It serves a profile as an HTML card, generates a downloadable **vCard (.vcf)**
on the fly, and accepts **contact-form** submissions through a pluggable sink.

This repo is meant as a *starting point / benchmark*. All identity is
placeholder-driven — there is no real personal data anywhere. Fill in
`data/profile.json` and the design in `public/` + `src/views/` to make it yours.

## Stack

- Node.js (>= 18), ES modules
- Express 4
- No database and no build step — a flat JSON profile powers everything
- Zero-dependency test suite via the built-in `node:test` runner

## Quick start

```bash
npm install
cp .env.example .env      # optional; sensible defaults if you skip this
npm run dev               # auto-reload, or: npm start
# open http://localhost:3000
```

## Endpoints

| Method | Path            | Purpose                                             |
|--------|-----------------|-----------------------------------------------------|
| GET    | `/`             | Rendered calling card (HTML)                        |
| GET    | `/vcard`        | Download a generated `.vcf` for the profile         |
| GET    | `/api/profile`  | The profile as JSON (for a SPA / mobile client)     |
| POST   | `/api/contact`  | Accept a contact message `{ name, email, message }` |
| GET    | `/healthz`      | Health check                                        |

Example contact submission:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Sample Person","email":"sample@example.com","message":"Hello"}'
```

## Configure your identity

Everything the card and vCard render comes from `data/profile.json`.
It is filled in for Erhica Amyr Sager / Good Cup Coffee Co. Every field below is
optional except `fullName` and `email` — leave one empty (`""`, or an empty
array) and its row drops out of the card rather than rendering blank:

| Token                 | Meaning                          |
|-----------------------|----------------------------------|
| `{{FULL_NAME}}`       | Display name                     |
| `{{FIRST_NAME}}` / `{{LAST_NAME}}` | Used for the vCard `N` field |
| `{{ROLE_PRIMARY}}` / `{{ROLE_SECONDARY}}` | Job titles / roles |
| `{{COMPANY_NAME}}` / `{{COMPANY_URL}}` | Organization |
| `{{EMAIL}}`           | Contact email                    |
| `{{PHONE_E164}}`      | Phone in E.164, e.g. `+10000000000` — drives `tel:` and the vCard |
| `phoneDisplay`        | Optional readable form shown on the card; falls back to `phone` |
| `{{CITY}}` / `{{COUNTRY}}` | Location footer             |
| `{{FEATURED_LABEL}}` / `{{FEATURED_URL}}` | Optional highlighted link |
| `{{WEBSITE_URL}}` / `{{INSTAGRAM_URL}}` / `{{FACEBOOK_URL}}` | Links row |

`roles`, `phone` and `featured` are empty today — fill them in and the card and
the vCard pick them up on the next request, no code change.

Each entry in `links` takes a `type`, a `label` and an optional `group`:

- `type` drives both the vCard line and which icon is drawn. Supported icons
  live in `src/lib/icons.js`: `mail`, `phone`, `website`, `facebook`,
  `instagram`, `linkedin`, `youtube`, and a `link` fallback for anything else.
- `label` is the icon's accessible name and hover tooltip. The glyph carries no
  visible text, so this is where the address, number or handle lives.
- `group` is `"personal"` (default) or `"company"`. A hairline divider is drawn
  wherever the group changes, so her own links read separately from Good Cup's.

Add more links by extending the `links` array — any `type` in the social set
(`instagram`, `facebook`, `linkedin`, `twitter`, `tiktok`, `youtube`) is emitted
to the vCard as `X-SOCIALPROFILE`; `website`/`url` become a `URL` line.

## Design

The card uses the **Good Cup design system** — Robusta `#46362B` on Crema `#EDE9E4`,
Dulce Coral `#F28778` as the single accent, Good Sans throughout. Source of truth:
`~/.claude/skills/good-cup-design` (`colors_and_type.css`, `README.md`).

- `public/styles.css` — brand tokens + card styling.
- `public/fonts/` — Good Sans Light / Regular / Medium, self-hosted so the card
  renders correctly offline and behind any CSP. Copied from the design system;
  do not re-export.
- `public/img/` — `logo-horizontal.png` (card header) and `logo-mark.png` (favicon),
  copied from `assets/` in the design system. Never redraw or rasterize a logo.

## Hosting (GitHub Pages)

The public card is served from `docs/` at
**https://erhica-products.github.io/calling-card/** — a static build, because
Pages cannot run the Express app.

```bash
npm run build:static     # regenerates docs/ from data/profile.json
```

`docs/` is generated, never hand-edited. The build reads the same
`data/profile.json`, `src/views/card.html` and `public/styles.css` the server
uses, inlines the CSS, Good Sans and logos as data URIs, and points
"Save contact" at `docs/erhica-amyr-sager.vcf` instead of the `/vcard` route.
Rebuild and commit `docs/` whenever the profile changes.

Repo settings → Pages → Source: `main` branch, `/docs` folder.

### Two profiles, on purpose

| File | Committed | Contents |
|---|---|---|
| `data/profile.json` | yes | Work contacts only — name, position, work email, company site, Good Cup's Facebook page. This is what the public site shows. |
| `data/profile.local.json` | **no** (gitignored) | The full card, including the personal mobile and personal Facebook profile. |

The published site is public and indexed, so personal contact details stay out
of the repo entirely. `build:static` reads only `data/profile.json` and never
the local file. To run the server against the full profile:

```bash
PROFILE_PATH=data/profile.local.json npm start
```

## Project layout

```
data/profile.json      # public identity — the single source of truth
data/profile.local.json # full identity incl. personal contacts (gitignored)
docs/                  # generated static site for GitHub Pages
scripts/build-static.mjs # builds docs/ from the profile + template + styles
public/                # brand stylesheet, Good Sans fonts, logo assets
src/
  server.js            # Express app factory + entrypoint
  config.js            # env-backed config with safe defaults
  lib/
    profile.js         # loads + validates the profile
    vcard.js           # builds an RFC-6350 vCard 3.0 string
    render.js          # tiny server-side HTML renderer (swap for a real engine)
  routes/
    card.js            # GET / and GET /api/profile
    vcard.js           # GET /vcard
    contact.js         # POST /api/contact (stub sink)
  views/card.html      # HTML template
test/vcard.test.js     # unit tests for the vCard builder
Dockerfile             # minimal production image
```

## Where to take it next

The contact route currently logs submissions (`CONTACT_SINK=log`). Natural
next steps for the backend: send email (nodemailer), persist to a database,
push to a queue, add rate limiting + captcha, and add auth if the profile
should be editable through an admin API. Point `deliver()` in
`src/routes/contact.js` at whichever you choose.

## Tests

```bash
npm test
```

## License

MIT — see `LICENSE` (fill in the copyright holder).
