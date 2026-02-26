
# Contributing to Devotional AI

## Change Process
All changes should be submitted via the specified XML `<changes>` format. Updates should be minimal, surgical, and focused on the requested feature or bug fix.

## Coding Standards
- **Components**: Use functional components with TypeScript interfaces for props.
- **Styling**: Strictly adhere to the existing Tailwind CSS palette (Primary: `#136dec`, Surface: `#161e2d`). Use the `glass` utility for headers and overlays.
- **Icons**: Use Google Material Symbols Outlined exclusively.
- **AI Integration**: Follow the `@google/genai` guidelines exactly. Use `gemini-3-flash-preview` for text tasks and `gemini-2.5-flash-image` for visual tasks.

## Testing Expectations
- **Manual Verification**: Test every clickable link, card, and image in the navigation flow.
- **AI Verification**: Ensure that prompts to the model include the necessary context to maintain the "AI Pastor" persona.
- **Responsive Design**: All screens must be optimized for the `max-w-md` (mobile-first) container.

## Refactoring vs. Incremental Changes
Incremental changes are preferred. Large-scale refactoring of services (e.g., `authService.ts`) should only be done if it significantly improves security or solves a blocking architectural issue.

> **AI Assistant Note**: Match existing code patterns exactly. If a new component is added, ensure its border-radius, padding, and typography match the "modern spiritual" aesthetic established in `HomeScreen.tsx`.
