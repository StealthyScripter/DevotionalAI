
# Domain Model: Devotional AI

## Core Concepts
1.  **AI Pastor**: The primary agent of interaction. It is not just an "LLM," but a specific persona defined by empathy, biblical grounding, and the "Fruits of the Spirit."
2.  **Devotional**: A structured unit of content containing a Title, Bible Verse, Message, Practical Application, and Call to Action.
3.  **Theme**: Spiritual categories (e.g., Hope, Healing, Anxiety) that guide the AI's generation logic.
4.  **Format**: The delivery medium for the spiritual content (e.g., SMS, Sermon Notes, Social Media Post).
5.  **Pipeline**: An administrative workflow where content is generated, reviewed, refined, and eventually "posted" (simulated).

## Important Invariants
- **Biblical Grounding**: Every generated devotional *must* reference a specific, valid Bible verse.
- **Identity Uniqueness**: No two users can register with the same email address (case-insensitive).
- **Master Admin Root**: The system recognizes `admin@devotional.ai` as the immutable root administrator. Only this account (and those it promotes) can access the Identity Registry.
- **Content Deduplication**: To preserve the sanctity and quality of the library, the system prevents saving identical content (Title + Verse matches).

## Terminology
- **"Shalom"**: Used as a welcoming intent in the UI.
- **"Daily Bread"**: Refers to the daily recurring content units.
- **"Invoke"**: The action of triggering the AI generation process.
- **"Identity Registry"**: The internal database of users accessible only to administrators.

> **AI Assistant Note**: Do not overload the term "Sermon." In this app, a "Sermon" is a long-form text document, while a "Social Post" is a short-form, high-engagement unit. Keep these boundaries clear in the code.
