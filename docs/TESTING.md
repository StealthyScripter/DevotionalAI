
# Testing Philosophy

## Philosophy
We prioritize **Functional UI Testing** and **Intent-Based AI Testing**. Since the core value of the app is the quality of spiritual guidance, testing focuses on the coherence and safety of AI responses.

## What to Test
1.  **Navigation Integrity**: Ensure that clicking a "Video" card routes to the `PreviewScreen` with the video player active.
2.  **Auth Flow**: Verify that the `ProtectedRoute` correctly redirects unauthenticated users to `/signin`.
3.  **AI Schema**: Ensure `geminiService` correctly parses JSON responses even when the model adds conversational "fluff."

## Manual Testing Checklist
- [ ] Sign up with `pastor@devotional.ai` to verify Admin role assignment.
- [ ] Trigger 2FA and verify code from the developer console.
- [ ] Generate a "Short Message" and verify it saves to the "Profile" tab.
- [ ] Click the Floating Action Button to ensure it opens the AI Chat exclusively.

## AI-Generated Tests
When asking an AI to generate tests, focus on edge cases for the `responseSchema` parsing in `geminiService.ts`.

> **AI Assistant Note**: Do not introduce a full E2E testing framework (like Cypress) unless requested. Manual verification of the routing paths in `AppContent` is currently sufficient.
