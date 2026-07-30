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
Out of the box it ships with placeholder tokens — replace them:

| Token                 | Meaning                          |
|-----------------------|----------------------------------|
| `{{FULL_NAME}}`       | Display name                     |
| `{{FIRST_NAME}}` / `{{LAST_NAME}}` | Used for the vCard `N` field |
| `{{ROLE_PRIMARY}}` / `{{ROLE_SECONDARY}}` | Job titles / roles |
| `{{COMPANY_NAME}}` / `{{COMPANY_URL}}` | Organization |
| `{{EMAIL}}`           | Contact email                    |
| `{{PHONE_E164}}`      | Phone in E.164, e.g. `+10000000000` |
| `{{CITY}}` / `{{COUNTRY}}` | Location footer             |
| `{{FEATURED_LABEL}}` / `{{FEATURED_URL}}` | Optional highlighted link |
| `{{WEBSITE_URL}}` / `{{INSTAGRAM_URL}}` / `{{FACEBOOK_URL}}` | Links row |

Add more links by extending the `links` array — any `type` in the social set
(`instagram`, `facebook`, `linkedin`, `twitter`, `tiktok`, `youtube`) is emitted
to the vCard as `X-SOCIALPROFILE`; `website`/`url` become a `URL` line.

## Project layout

```
data/profile.json      # placeholder-driven identity (the single source of truth)
public/                # static assets (CSS today; images/favicon later)
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
