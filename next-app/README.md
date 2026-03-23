# BG Remover — Next.js App

> Frontend application for image background removal.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API:** Next.js API Routes → Remove.bg API

## Getting Started

### 1. Install dependencies

```bash
cd next-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local and add your Remove.bg API key
```

Get your free API key at [remove.bg/api](https://www.remove.bg/api).

### 3. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REMOVE_BG_API_KEY` | ✅ | Remove.bg API key |

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set `REMOVE_BG_API_KEY` in Vercel dashboard → Settings → Environment Variables.

### Docker

```bash
docker build -t bg-remover .
docker run -p 3000:3000 --env-file .env.local bg-remover
```

## API

### `POST /api/remove-bg`

Remove background from an image.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file field)

**Response:**
- Content-Type: `image/png`
- Returns transparent PNG image
