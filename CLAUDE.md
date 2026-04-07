# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

SubScope is a Next.js 16 app (React 19, Tailwind CSS 4) with a single user-facing page and one API route.

### Data flow

1. **[src/app/page.tsx](src/app/page.tsx)** — Client component. User submits a handle/URL; it fetches `/api/profile?handle=...` and reads the response as a streaming NDJSON (newline-delimited JSON) body, updating state incrementally as chunks arrive.

2. **[src/app/api/profile/route.ts](src/app/api/profile/route.ts)** — GET handler (`maxDuration = 60`). Returns a `ReadableStream` with three chunk types in order:
   - `{ type: "profile", profile, topPosts }` — sent immediately after scraping the profile page and fetching the top 50 posts
   - `{ type: "progress", pagesScanned, notesFound }` — sent every 5 pages while paginating the notes feed (up to 200 pages)
   - `{ type: "complete", topNotes, stats }` — sent after all notes are collected

3. **[src/types.ts](src/types.ts)** — Shared types for `StreamChunk` (the discriminated union), `ProfileData`, `PostData`, `NoteData`, and `Stats`. Both the route and the page import from here.

### Scraping strategy

- Profile data is parsed from the inline `window._preloads` JSON embedded in `substack.com/@<handle>` HTML. `extractPreloads()` does a backslash-aware scan to find the closing `")` delimiter.
- Posts come from `substack.com/api/v1/profile/posts?profile_user_id=<id>`.
- Notes come from `substack.com/api/v1/reader/feed/profile/<id>?types=note` (cursor-paginated). Only items with `type: "comment"` are counted; restacks/reposts are skipped. Notes older than 6 months stop pagination early.

### Image domains

`next.config.ts` allowlists `substack-post-media.s3.amazonaws.com`, `*.substack.com`, and `substackcdn.com` for `next/image`. Profile avatars use `unoptimized` to avoid resizing proxied images.
