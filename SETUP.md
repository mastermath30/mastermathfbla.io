# MathMaster — Setup & Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER  (AIMathTutor.tsx)                                     │
│                                                                 │
│  User types a message → fetch( API_BASE + "/api/ai" )           │
│                              │                                  │
│  API_BASE is either:         │                                  │
│    "" (same origin)     ─────┤                                  │
│    "https://hosted.app" ─────┤                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND SERVER  (src/app/api/ai/route.ts)                      │
│                                                                 │
│  • Reads ANTHROPIC_API_KEY from process.env (server-only)       │
│  • Forwards the request to Anthropic Messages API (Claude)      │
│  • Returns { reply: "..." } to the frontend                    │
│  • CORS enabled for cross-origin local dev                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  ANTHROPIC API  (Claude)                                        │
│  https://api.anthropic.com/v1/messages                          │
└─────────────────────────────────────────────────────────────────┘
```

**Key security principle:** The `ANTHROPIC_API_KEY` never leaves the server.
It is NOT a `NEXT_PUBLIC_*` variable, so Next.js will never bundle it into
the client-side JavaScript.

---

## File Structure (relevant files)

```
src/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── route.ts        ← Backend proxy (Claude key lives here)
│   ├── layout.tsx              ← Root layout (mounts AIMathTutor globally)
│   └── ...pages
├── components/
│   └── AIMathTutor.tsx         ← Frontend chat UI (calls /api/ai)
.env.example                    ← Template for environment variables
.env.local                      ← Your local secrets (git-ignored)
SETUP.md                        ← This file
```

---

## Running Locally

### Option A — Full stack (you have the API key)

```bash
# 1. Copy the env template
cp .env.example .env.local

# 2. Add your Anthropic key to .env.local
#    ANTHROPIC_API_KEY=sk-ant-...
#    NEXT_PUBLIC_API_URL=          ← leave empty

# 3. Install dependencies & run
npm install
npm run dev
```

The frontend calls `/api/ai` on the same origin (localhost:3000).

### Option B — Frontend only (teammate without the API key)

```bash
# 1. Copy the env template
cp .env.example .env.local

# 2. Point at the hosted backend
#    ANTHROPIC_API_KEY=            ← leave empty, you don't need it
#    NEXT_PUBLIC_API_URL=https://mathmaster.vercel.app

# 3. Install dependencies & run
npm install
npm run dev
```

The frontend calls the deployed backend at the URL you specified.
You can work on all frontend code without ever touching the API key.

---

## Deploying (Vercel)

1. Push your code to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. In the Vercel dashboard, go to **Settings → Environment Variables** and add:

   | Name                    | Value              | Environment  |
   |-------------------------|--------------------|--------------|
   | `ANTHROPIC_API_KEY`     | `sk-ant-...`       | Production   |
   | `NEXT_PUBLIC_API_URL`   | *(leave empty)*    | Production   |

4. Deploy. The backend route will read `ANTHROPIC_API_KEY` from the server
   environment and the frontend will call `/api/ai` on the same origin.

> **Important:** Never put `ANTHROPIC_API_KEY` in a `NEXT_PUBLIC_*` variable.
> That would expose it to every browser that loads your site.

---

## Environment Variables Reference

| Variable               | Where it runs | Required by         | Description                                      |
|------------------------|---------------|---------------------|--------------------------------------------------|
| `ANTHROPIC_API_KEY`    | Server only   | Backend deployer    | Anthropic secret key for Claude                  |
| `NEXT_PUBLIC_API_URL`  | Client bundle | Frontend-only devs  | URL of hosted backend (empty = same origin)      |

---

## How the Frontend Calls the Backend

```typescript
// In AIMathTutor.tsx:
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const response = await fetch(`${API_BASE}/api/ai`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ message, history }),
});

const data = await response.json();
// data.reply contains the AI response
```

- When `NEXT_PUBLIC_API_URL` is empty → calls `/api/ai` (same server)
- When `NEXT_PUBLIC_API_URL` is set → calls `https://hosted.app/api/ai`
