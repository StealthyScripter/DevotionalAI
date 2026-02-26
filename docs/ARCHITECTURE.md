
# Architecture: Devotional AI

## High-Level System Overview
Devotional AI is a React-based Single Page Application (SPA) that functions as a client-side "Spiritual Companion." It leverages the Google Gemini API directly from the frontend to perform complex reasoning, content generation, and conversational support.

### Component Stack
- **Frontend Framework**: React 19 (ES6 Modules)
- **Routing**: React Router (HashRouter)
- **Styling**: Tailwind CSS (Utility-first, Dark Mode focused)
- **AI Engine**: `@google/genai` (utilizing Gemini 3 and 2.5 series models)
- **Persistence**: Browser `localStorage` and `sessionStorage`

## Key Modules & Boundaries
1.  **AI Services (`geminiService.ts`)**: The core logic boundary. Encapsulates system instructions and model configurations. It enforces the "Pastoral Voice" across all AI interactions.
2.  **Auth Service (`authService.ts`)**: Manages local user simulation, 2FA flows, and session validation. It enforces a strict **Identity Integrity Layer** to prevent duplicate accounts.
3.  **Storage Service (`storageService.ts`)**: Abstracted interface for saving generated content and drafts. It enforces **Data Deduplication** via composite keys.
4.  **UI Screens**: Individual route-level components (`HomeScreen`, `ChatScreen`, etc.) that handle user interaction and local state.

## Data Integrity Rules
- **Account Uniqueness**: Enforced via case-insensitive email comparison during registration.
- **Master Admin**: A hardcoded deterministic root identity (`admin@devotional.ai`) that serves as the bootstrap for administrative tasks.
- **Content Deduplication**: Devotionals are compared by `title` and `bibleVerse` before persistence to prevent library pollution.

## Data Flow
1.  **Request**: User triggers an action (e.g., "Invoke AI Pastor").
2.  **Context Construction**: `geminiService` bundles user input with strict `SYSTEM_INSTRUCTION` and `responseSchema`.
3.  **AI Execution**: Call to `ai.models.generateContent` with the API Key provided via environment variables.
4.  **Parsing & Storage**: Result is parsed as JSON, validated against the `GeneratedContent` interface, and persisted to `localStorage` after integrity checks.
5.  **Rendering**: UI updates to show the generated content in the `PreviewScreen`.

## Constraints & Non-Goals
- **Non-Goal**: Real-time multi-user collaboration. This app is currently scoped for local, individual spiritual journeys.
- **Constraint**: API calls are made directly from the client. This requires the `process.env.API_KEY` to be injected securely by the environment.

> **AI Assistant Note**: When modifying the architecture, prioritize maintaining the simplicity of the current Service/Screen separation. Do not introduce complex state management libraries (like Redux or Recoil) unless the application state grows beyond the manageable capacity of local hooks and services.
