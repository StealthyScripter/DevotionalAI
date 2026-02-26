# DevotionalAI

A Christian spiritual guidance app with AI-powered devotional content generation, authentication, content pipeline management, and community features.

## Architecture

### Frontend
- **Framework**: React 19 + TypeScript + Vite 6
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS (CDN)
- **AI Integration**: Google Gemini via `@google/genai`
- **Dev Port**: 5000 (host: 0.0.0.0)

### Backend
- **Runtime**: Node.js (pure HTTP, no framework)
- **File**: `backend/server.mjs`
- **Port**: 8080 (localhost)
- **Database**: JSON file (`backend/db.json`)
- **Auth**: Custom HMAC token + PBKDF2 password hashing, 2FA via console codes

### Proxy
Vite proxies `/api/*` requests to `http://localhost:8080`.

## Key Files

- `vite.config.ts` - Vite config with proxy and host settings
- `backend/server.mjs` - Full backend API server
- `App.tsx` - Main React app entry
- `index.tsx` - React root render
- `index.html` - HTML entry point
- `screens/` - All page-level screen components
- `content/spiritualContent.ts` - Static spiritual content
- `geminiService.ts` - Gemini AI integration
- `authService.ts` - Auth API calls
- `storageService.ts` - Data persistence API calls
- `types.ts` - Shared TypeScript types

## Environment Variables

- `GEMINI_API_KEY` - Google Gemini API key (required for AI generation)
- `AUTH_TOKEN_SECRET` - HMAC secret for tokens (auto-generated if not set)
- `MASTER_ADMIN_EMAIL` - Admin login email (default: admin@devotional.ai)
- `MASTER_ADMIN_PASSWORD` - Admin password (default: Devotional@2025&Home)

## Workflows

- **Start application** - `npm run dev` on port 5000 (webview)
- **Backend API** - `node backend/server.mjs` on port 8080 (console)

## Deployment

Configured as `autoscale` with:
- Build: `npm run build`
- Run: starts backend + vite preview on port 5000
