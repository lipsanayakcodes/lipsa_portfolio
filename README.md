# Lipsa's Portfolio

A responsive React and Vite portfolio with a small Node.js server and a password-protected content editor.

## Run locally

Install the existing project dependencies, then start the combined development server:

```bash
npm install
npm run dev
```

Open the local URL printed by the server (normally `http://localhost:3001`). If that port is busy, the server tries the next available port. On its first start, the server creates a local `.env` file with a random admin password and session secret, then prints the admin username and password in the terminal. Save the password. Add `/admin` to the printed URL to sign in.

The admin panel can add, edit, and remove skills, education entries, and experience entries. Choose **Save changes** to publish them. Content is saved in `server/data/content.json` and used by the public portfolio.

## Production

Build the frontend and run the server in production mode:

```bash
npm run build
```

PowerShell:

```powershell
$env:NODE_ENV = 'production'
npm start
```

Set a strong `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET` as environment variables on the hosting service. Use HTTPS in production. The production server serves the built site and API from the same origin.

The server writes editable content to `server/data/content.json`. Production hosting must provide persistent writable storage for that file (or back up and restore it on deploy); temporary server filesystems can lose edits when an instance restarts. Keep `.env` private and do not commit it.

## Project layout

- `src/components/` contains the portfolio sections and admin panel.
- `src/defaultContent.js` contains the initial skills, education, and experience records.
- `server/index.js` serves the API, development frontend, and production build.
- `server/data/content.json` is created from the defaults on first run and stores later edits.
