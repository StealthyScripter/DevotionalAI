
# GitHub Repository Setup & Project Description

## Project Overview
**Devotional AI** is a mobile-first spiritual companion and Christian content orchestration engine. It uses Google’s Gemini 3 Pro and Flash models to provide personalized biblical guidance, generate multi-format spiritual content, and facilitate empathetic pastoral counseling.

## Repository Description
> 🕊️ An AI-powered Christian devotional companion. Generate scripture-based reflections, sermons, and social media scripts using Google Gemini. Features a compassionate AI Pastor chat, admin content pipeline, and faith journey tracking.

**Topics**: `ai`, `christian`, `gemini-api`, `react`, `tailwind-css`, `spiritual-wellness`, `content-automation`

---

## Technical Setup

### 1. Environment Variables
This project requires a Google Gemini API Key. The application expects this to be injected at build time or via the execution environment.

- **Variable Name**: `API_KEY`
- **Source**: [Google AI Studio](https://aistudio.google.com/)

### 2. Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/devotional-ai.git
   cd devotional-ai
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```

### 3. Deployment Configuration
This is a Single Page Application (SPA) using `HashRouter`. It is compatible with static hosting providers like Vercel, Netlify, or GitHub Pages.

**Vercel / Netlify Settings**:
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (or `build`)
- **Environment Variables**: Add `API_KEY` in the provider's dashboard.

---

## Repository Structure
- `docs/`: Comprehensive technical and domain documentation.
- `screens/`: React components representing individual app views.
- `authService.ts`: Mock authentication and session management.
- `geminiService.ts`: Integration logic for @google/genai.
- `types.ts`: Shared TypeScript interfaces and enums.

## Features Checklist
- [x] **AI Pastor Chat**: Empathy-driven counseling.
- [x] **Devotional Studio**: Multi-format content generation (SMS, Video, Sermon).
- [x] **Admin Pipeline**: Workflow for reviewing and approving AI drafts.
- [x] **Faith Journey**: Streak tracking and local prayer journaling.

---

> **AI Assistant Note**: When setting up the repository, ensure that `docs/` is ignored by Git if you intend for this documentation to remain local to the development environment only. Always match the established mobile-first (max-w-md) container constraints when adding new UI elements or repository assets.
