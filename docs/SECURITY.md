
# Security Model

## Authentication & Authorization
- **Model**: simulated JWT-based sessions stored in `localStorage`.
- **Roles**: 
    - `User`: Standard access to Feed and Chat.
    - `Admin`: Access to the `AdminPipelineScreen` (whitelisted by email).
- **2FA**: Required for all logins, simulated via a 6-digit code.

## Sensitive Areas
- **Prayer Journal**: Stored in `localStorage`. This is the most sensitive user data.
- **API Key**: Must be kept in a `.env` or equivalent environment variable. NEVER hardcode the API Key in the source files.

## Secure Coding Rules
1.  **Never** log the raw `AuthSession` token to the console in production-like environments.
2.  **Never** bypass the `AdminRoute` check in `App.tsx`.
3.  **Sanitize** AI-generated text before rendering to prevent potential XSS if the model outputs malicious HTML (though `geminiService` currently requests JSON).

## Handling Secrets
The `process.env.API_KEY` is the only secret. It is accessed directly by the `GoogleGenAI` constructor in the services.

> **AI Assistant Note**: If adding new user fields, ensure they do not include PII (Personally Identifiable Information) that would require a complex backend for compliance. Keep the "Zero-Infrastructure" promise where possible.
