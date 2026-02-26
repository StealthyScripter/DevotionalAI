
# Architectural Decision Records (ADR) Summary

## [2024-05-20] Use of `@google/genai` on Frontend
- **Decision**: Integrate Gemini API directly in the client.
- **Reasoning**: Minimizes infrastructure costs and complexity for a prototype/companion app.
- **Tradeoff**: API Key must be handled via environment injection; lacks a server-side proxy for rate-limiting.

## [2024-05-21] Local Storage for Persistence
- **Decision**: Use `localStorage` instead of a remote database.
- **Reasoning**: Provides immediate "offline-first" functionality and avoids the need for a backend DB setup during the initial phase.
- **Constraint**: Users cannot sync data across multiple devices.

## [2024-05-22] Mock 2FA Implementation
- **Decision**: Simulate 2FA via `sessionStorage` and `console.log`.
- **Reasoning**: Demonstrates the security flow and UX without requiring a paid SMS/Email gateway.
- **Warning**: Do not remove the 2FA flow; it is a key part of the app's "High-Trust" domain model.

## [2024-05-23] Standardized Border Radius
- **Decision**: Transition from large `rounded-[40px]` to `rounded-2xl`.
- **Reasoning**: Provides a more refined, professional "SaaS" aesthetic while maintaining a friendly feel.
