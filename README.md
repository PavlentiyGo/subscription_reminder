# TG MiniApp — Subscriptions (React)

Minimal Vite + React TypeScript app with a single `Subscriptions` page that calls backend endpoints:

- `GET http://localhost:5050/subscriptions` — includes Telegram initData in `Authorization` header
- `POST http://localhost:5050/subscriptions` — creates a subscription

Quick start:

```bash
cd tgMiniApp
npm install
npm run dev
```

Open the app at `http://localhost:5173`.

Notes:
- The page reads `window.Telegram.WebApp.initData` (if available) and sends it as `Authorization` header.
- Adjust `BASE` in `src/pages/Subscriptions.tsx` if your API is at a different host/port.
