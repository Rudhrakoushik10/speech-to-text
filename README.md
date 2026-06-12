# Speech to Text

A real-time speech-to-text web application with Nhost authentication and Deepgram transcription.

## Features

- **Authentication** — Sign up / Sign in with email + password via Nhost
- **Real-time Speech-to-Text** — Live microphone capture streamed to Deepgram via WebSocket with interim results
- **Responsive UI** — Tailwind CSS with a clean, modern design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4, Lucide icons |
| Auth | Nhost (direct REST API) |
| Transcription | Deepgram (WebSocket, Nova-2 model) |

## Prerequisites

- Node.js 18+
- Nhost account with a project
- Deepgram API key

## Setup

1. **Clone the repo**

```bash
git clone <repo-url>
cd speech-to-text
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_NHOST_SUBDOMAIN=your-nhost-subdomain
VITE_NHOST_REGION=your-nhost-region
VITE_DEEPGRAM_KEY=your-deepgram-api-key
```

4. **Run the dev server**

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. Create an account or sign in
2. Click **"Start listening"** to begin microphone capture
3. Speak — transcript appears in real-time
4. Click **"Stop listening"** to end the session

## Build for Production

```bash
npm run build
```

Output goes to `dist/`, ready to deploy as a static site.

## Deployment (Render)

1. Connect your repository to Render
2. Set **Build Command**: `npm run build`
3. Set **Publish Directory**: `dist`
4. Add environment variables in Render dashboard
5. Add a **Rewrite Rule**: `/* → /index.html (200)` for SPA routing

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_NHOST_SUBDOMAIN` | Nhost project subdomain |
| `VITE_NHOST_REGION` | Nhost region (e.g. `eu-central-1`) |
| `VITE_DEEPGRAM_KEY` | Deepgram API key |
