# Admin Dashboard Setup (Hostinger)

The admin panel lives at **https://shoaibecommerce.com/admin**. It edits: WhatsApp main number, community link, support team and managers, top ticker, home hero copy, pricing and seats, bank details, guarantee line, videos, and social links. Changes go live immediately after saving.

It needs two things on the server: a MySQL database and a `.env` file.

## 1. Create the MySQL database

In hPanel: **Databases → MySQL Databases**

1. Database name: `site` (becomes `u289188798_site`)
2. Username: `site` (becomes `u289188798_site`)
3. Password: generate a strong one and note it down
4. Click **Create**

No tables needed — the app creates its own table (`site_content`) on first save.

## 2. Create the .env file

In hPanel: **Files → File Manager**, go to the folder the site deploys to (`public_html`), create a file named `.env` with:

```
ADMIN_PASSWORD=choose-a-strong-admin-password
AUTH_SECRET=a-long-random-string-you-set-once-and-never-change
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u289188798_site
DB_USER=u289188798_site
DB_PASSWORD=the-database-password-from-step-1
```

`ADMIN_PASSWORD` is what you type at /admin/login. It is separate from the database password.

`AUTH_SECRET` signs login sessions and encrypts the 2FA secret. Set it to a long
random string (40+ characters, letters and digits) **once** and never change it —
changing it logs everyone out and forces the authenticator to be set up again.

## 3. Redeploy once

Trigger a redeploy (push to GitHub or redeploy from hPanel) so the app restarts and picks up the `.env` file.

## 4. Verify

1. Open https://shoaibecommerce.com/admin → log in with `ADMIN_PASSWORD`
2. The badge at the top must say **Database connected** (green). If it says **Local file mode** (amber), the DB env vars are wrong or missing — edits would not survive redeploys.
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

- The `.env` file is not in git, so redeploys from GitHub do not overwrite it. If a deploy ever wipes the folder, recreate `.env` from this guide.
- Changing `ADMIN_PASSWORD` logs out all admin sessions (but keeps the 2FA setup).
- Never change `AUTH_SECRET` after go-live — it invalidates sessions and the 2FA secret.
- The 2FA secret is stored **encrypted** in the database; recovery codes are stored hashed.
- Content stored in the database survives redeploys; defaults for anything never edited come from `lib/site.ts`.
