# shoaibecomerce.com — ads landing page

Next.js 16 (App Router) landing page for paid traffic, with a MySQL-backed admin
CMS at `/admin`. Deployed as its own Hostinger Node.js app with its own database.

> **Not the same site as shoaibecommerce.com (two 'm's).** That is the separate,
> organic-traffic main site, with a separate repo, database, and credentials.
> Nothing here should ever be deployed to it.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Configuration

Copy `.env.example` to `.env` and fill it in. Full server setup — database,
secrets, 2FA, verification steps — is in [ADMIN-SETUP.md](ADMIN-SETUP.md).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Falls back to `https://shoaibecomerce.com`. |
| `ADMIN_PASSWORD` | Password for `/admin/login`. Must differ from the main site's. |
| `AUTH_SECRET` | Signs sessions, encrypts the 2FA secret. Set once, never change. |
| `DB_*` | Hostinger MySQL connection. Without it, content edits fall back to a local `.data/content.json` (dev only). |

## SEO

This site is **not indexed on purpose** — traffic comes from ads only:

- `app/robots.ts` disallows all crawlers.
- The root metadata in `app/layout.tsx` sets `index: false, follow: false`.
- There is no `app/sitemap.ts`, so no `sitemap.xml` is published.

Keep it that way unless the site's role changes.

## Layout

- `app/` — routes, `robots.ts`, admin panel under `app/admin/`
- `components/` — UI, with admin forms in `components/admin/`
- `lib/site.ts` — site identity and default content, the single edit point
- `lib/content.ts` / `lib/content-store.ts` — admin overrides on top of those defaults
