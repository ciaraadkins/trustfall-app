# Trustfall App

A game exploration of trust and strategy between humans and AI. Chat with an AI opponent, then choose to SHARE or KEEP.

## Getting Started

1. Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`. No Firebase config is needed; accounts are off and everyone plays as a local guest.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

Scores and round history live in memory and reset on refresh.

## How it works

- The browser calls two server routes: `POST /api/game/message` (returns `{ reply }`) and `POST /api/game/decide` (returns `{ decision }`). Both take `{ model, roundId, messages, sessionStats }`, validated with zod.
- The server builds the prompts, picks the model and token limits, and calls the providers with the official SDKs. API keys are read from server-only env vars and never reach the browser.
- Decisions use structured output (a JSON schema with `SHARE`/`KEEP`). A bad response is retried once, then shown as an error; the game never picks a random move.
- Models are configured in `lib/models.ts`. Override the provider model with `CLAUDE_MODEL` or `OPENAI_MODEL`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run knip` | Find unused files, exports, and dependencies |
