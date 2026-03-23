# 🎯 BG Remover

> One-click image background removal powered by Cloudflare Worker + Remove.bg API.

**No sign-up · No storage · No cost for 500 images/month**

![Demo](https://img.shields.io/badge/Status-MVP-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- 🚀 **One-click removal** — Upload and get transparent PNG in seconds
- 🔒 **Privacy-first** — Images processed in memory, never stored
- 🌎 **Global edge** — Powered by Cloudflare Workers (150+ locations)
- 📱 **Responsive** — Works on desktop and mobile
- 💰 **Free tier** — 500 images/month free via Remove.bg API

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/weilily219110/image-background-remover.git
cd image-background-remover
npm install
```

### 2. Set up Remove.bg API Key

1. Get your free API key at [remove.bg/api](https://www.remove.bg/api)
2. Create a `.dev.vars` file for local development:

```bash
echo "REMOVE_BG_API_KEY=your_api_key_here" > .dev.vars
```

3. For production, use Cloudflare Secrets:

```bash
npx wrangler secret put REMOVE_BG_API_KEY
```

### 3. Run Locally

```bash
npm run dev
```

Visit `http://localhost:8787`

### 4. Deploy to Cloudflare

```bash
npm run deploy
```

---

## Architecture

```
User Upload → Cloudflare Worker → Remove.bg API → Stream Response
                  (in-memory, no storage)
```

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Vanilla JS + CSS | Upload, preview, download |
| Backend | Cloudflare Worker (TypeScript) | API proxy, validation |
| AI Engine | Remove.bg API | Background removal |

---

## API

### `POST /`

Remove background from an image.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file field)

**Response:**
- Content-Type: `image/png`
- Returns: Transparent PNG image

**Errors:**
```json
{ "error": "No image file provided" }
{ "error": "Unsupported file type" }
{ "error": "File too large. Max 10MB." }
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REMOVE_BG_API_KEY` | ✅ | Remove.bg API key |
| `ALLOWED_ORIGIN` | ❌ | CORS origin (default: `*`) |

### Limits

| Limit | Value |
|-------|-------|
| Max file size | 10 MB |
| Supported formats | JPG, PNG, WebP |
| Free monthly quota | 500 images (Remove.bg) |

---

## Roadmap

- [ ] Add AI background generation (replace background with custom scene)
- [ ] Batch processing (up to 10 images)
- [ ] Chrome extension for one-click removal
- [ ] Stripe integration for pay-as-you-go
- [ ] Self-hosted model (RMBG-1.4) for cost reduction

---

## License

MIT © weilily219110
