# Admin Dashboard Setup (Hostinger)

> This guide is for **shoaibecomerce.com** (one 'm') — the ads landing page. It runs
> as its own Hostinger Node.js app with its own database. Every credential below
> must be new; nothing is shared with the main shoaibecommerce.com site.

The admin panel lives at **https://shoaibecomerce.com/admin**. It edits: WhatsApp main number, community link, support team and managers, top ticker, home hero copy, pricing and seats, bank details, guarantee line, videos, and social links. Changes go live immediately after saving.

It needs two things on the server: a MySQL database and a set of environment
variables.

## 1. Create the MySQL database

In hPanel: **Databases → MySQL Databases**

1. Database name: pick one that is clearly this site's, e.g. `shoaibecomerce`
   (hPanel prefixes it, so it becomes something like `u289188798_shoaibecomerce`)
2. Username: same
3. Password: generate a strong one and note it down
4. Click **Create**

Create a **new** database — do not reuse the main site's. Copy the exact prefixed
names hPanel shows you into `.env` below.

No tables needed — the app creates its own table (`site_content`) on first save.

## 2. Set the environment variables

In hPanel: **Websites → shoaibecomerce.com → Environment variables**. Add each of
these (the **Import .env** button accepts the whole block at once):

```
NEXT_PUBLIC_SITE_URL=https://shoaibecomerce.com
ADMIN_PASSWORD=choose-a-strong-admin-password
AUTH_SECRET=a-long-random-string-you-set-once-and-never-change
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=the-prefixed-db-name-from-step-1
DB_USER=the-prefixed-db-user-from-step-1
DB_PASSWORD=the-database-password-from-step-1
```

**`DB_HOST` must be `127.0.0.1`, not `localhost`.** Node resolves `localhost` to
the IPv6 address `::1` first, and the MySQL user is only granted access from
`127.0.0.1`/`localhost`. With `localhost` the app fails with
`Access denied for user ...@'::1'` even when the password is perfectly correct.

If the database password ever needs changing, the hPanel form enforces a
character-mix policy; the Hostinger API sets it without that fight.

`ADMIN_PASSWORD` is what you type at /admin/login. It is separate from the
database password, and it is compared case-sensitively.

**`ADMIN_PASSWORD` and `AUTH_SECRET` must be different from the main site's.** Sharing
either one would let a leak on one site compromise the other.

`NEXT_PUBLIC_SITE_URL` sets the canonical origin used in canonical tags, Open Graph
tags, and schema.org. Unset, it falls back to `https://shoaibecomerce.com`.

`AUTH_SECRET` signs login sessions and encrypts the 2FA secret. Set it to a long
random string (40+ characters, letters and digits) **once** and never change it —
changing it logs everyone out and forces the authenticator to be set up again.

## 3. Redeploy once

Trigger a redeploy (push to GitHub or redeploy from hPanel) so the app restarts
and picks up the variables.

## 4. Verify

1. Open https://shoaibecomerce.com/admin → log in with `ADMIN_PASSWORD`
2. The badge at the top must say **Synced** (green). **Saves not working** (red)
   means the DB variables are set but the connection is failing — the exact
   MySQL error is printed right below the badge. **Practice mode: edits may not
   stick** (amber) means the DB variables are missing entirely, so edits go to a
   local file that redeploys can wipe.
3. Change something small (e.g. seats left), save, open the home page — the ticker and pricing should show it immediately.

## 5. Two-factor login (2FA)

Login is two steps: password, then a 6-digit code from an authenticator app.

**First login sets it up** — after entering the password the first time, the admin
is walked through a one-time setup: scan a QR code with **Google Authenticator**,
**Authy**, or any similar app, then confirm with a code. The app also shows **8
recovery codes** — save them. Each recovery code logs in once if the phone is lost.

After setup, every login is: password → 6-digit code from the app.

### If the admin is locked out (phone lost AND recovery codes gone)

This is the break-glass reset. It clears the authenticator so the next login runs
setup again from scratch.

1. hPanel → **Databases → phpMyAdmin** → open the database
2. Run this SQL (or delete the single row in the `admin_2fa` table):
   ```sql
   DELETE FROM admin_2fa WHERE id = 1;
   ```
3. Log in at /admin — the password step now leads back into 2FA setup.

The admin password is unaffected; only the authenticator is reset.

## Notes

- The environment variables live in hPanel, not in git, so redeploys from GitHub do not overwrite them.
- Changing `ADMIN_PASSWORD` logs out all admin sessions (but keeps the 2FA setup).
- Never change `AUTH_SECRET` after go-live — it invalidates sessions and the 2FA secret.
- The 2FA secret is stored **encrypted** in the database; recovery codes are stored hashed.
- Content stored in the database survives redeploys; defaults for anything never edited come from `lib/site.ts`.
