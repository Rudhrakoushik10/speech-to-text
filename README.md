# Speech to Text

Real-time speech-to-text web app with Nhost authentication and Deepgram transcription.

## Features

- **Authentication** — Sign up / Sign in with email + password via Nhost
- **Live Transcription** — Real-time mic capture streamed to Deepgram WebSocket (Nova-2 model) with interim results
- **Production Ready** — Error boundaries, SPA routing, secure env var handling

## Tech Stack

| Frontend | Auth | Transcription | Styling |
|----------|------|---------------|---------|
| React 19 | Nhost (REST API) | Deepgram SDK v3 | Tailwind CSS v4 |
| TypeScript | Direct fetch | WebSocket live | Lucide icons |
| Vite 6 | localStorage sessions | Nova-2 model | Olive/Beige theme |

## Quick Start

### Prerequisites

- Node.js 18+
- [Nhost](https://nhost.io) project
- [Deepgram](https://deepgram.com) API key

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
#   VITE_NHOST_SUBDOMAIN=your-nhost-subdomain
#   VITE_NHOST_REGION=your-nhost-region (e.g. eu-central-1)
#   VITE_DEEPGRAM_KEY=your-deepgram-api-key

# Start dev server
npm run dev
```

Open http://localhost:5173

## Usage

1. **Sign up** — Create an account with email + password
2. **Sign in** — Log in to access the dashboard
3. **Transcribe** — Click "Start listening", speak into your mic, see live transcript
4. **Sign out** — End session from the dashboard header

> **Note:** If sign-up shows "Check your email to verify", your Nhost project has email verification enabled. You can disable it in Nhost Dashboard → Settings → "Require email verification" or verify the user in the auth.users table.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (output: `dist/`) |
| `npm run preview` | Preview production build locally |

## Deployment (Render)

1. Connect repo to [Render](https://dashboard.render.com) as a **Static Site**
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Render dashboard
5. SPA routing handled automatically via `public/_redirects`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_NHOST_SUBDOMAIN` | Yes | Nhost project subdomain |
| `VITE_NHOST_REGION` | Yes | Nhost region (e.g. `eu-central-1`) |
| `VITE_DEEPGRAM_KEY` | Yes | Deepgram API key |

## Project Structure

```
├── public/
│   └── _redirects          # SPA routing for Render/Netlify
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx    # Transcription UI with mic controls
│   │   ├── ErrorBoundary.tsx# React error fallback
│   │   ├── Login.tsx        # Auth form (sign in / sign up)
│   │   └── ProtectedRoute.tsx# Auth guard wrapper
│   ├── hooks/
│   │   └── useDeepgram.ts   # Deepgram WebSocket live transcription
│   ├── lib/
│   │   └── auth.ts          # Nhost direct-fetch auth
│   ├── App.tsx              # Routes + AuthContext provider
│   ├── index.css            # Tailwind CSS imports + theme
│   ├── main.tsx             # Entry point with ErrorBoundary
│   └── vite-env.d.ts
├── .env.example             # Environment variable template
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
