# EduAgent AI

Phase 2 implements the core tutoring chat experience with a reusable architecture.

## Implemented in Phase 2

- Premium chat UI with message bubbles and responsive layout
- In-memory chat state with typed message structure
- Typing indicator while assistant response is pending
- API route at `/api/chat`
- Service abstraction at `src/lib/chat/service.ts`
- Tutoring-focused system prompt and Gemini-compatible HTTP integration
- Graceful fallback mock tutor response when no API key is configured

## Folder Map

- `src/app/chat/page.tsx`
- `src/components/chat/ChatContainer.tsx`
- `src/components/chat/ChatInput.tsx`
- `src/components/chat/ChatMessage.tsx`
- `src/components/chat/TypingIndicator.tsx`
- `src/lib/chat/types.ts`
- `src/lib/chat/service.ts`
- `src/app/api/chat/route.ts`

## Environment Variables

Use `.env.local` for local development:

- `GEMINI_API_KEY=` (recommended, server-side)
- `NEXT_PUBLIC_GEMINI_API_KEY=` (fallback only; avoid in production)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open:

- `http://localhost:3000/chat`

## Data Flow

User message -> UI optimistic update -> `/api/chat` -> chat service -> assistant response -> UI render -> auto-scroll

## Notes

- This phase does not include authentication, persistent history, ElasticSearch, or PDF ingestion.
- Phase 3 can add user sessions and persistence.
