# SubScope

Substack profile analytics tool. Users enter a handle or URL; the app fetches and displays profile stats, top posts, and top notes ranked by hearts.

## Commands

```bash
npm run dev      # Dev server on http://localhost:3000
npm run build    # Production build (also runs TypeScript check)
npm run lint     # ESLint
npm start        # Serve production build
```

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 — imported via `@tailwindcss/postcss`, NOT `@tailwindcss/vite`. No `tailwind.config.ts`.
- No external UI libraries, no auth, no database

## Architecture

```
src/
  app/
    page.tsx              # Client component: search form + profile card + posts + notes
    layout.tsx            # Root layout (Geist font, metadata)
    globals.css           # Single line: @import "tailwindcss"
    api/
      profile/
        route.ts          # GET /api/profile?handle=<input> — all Substack fetching
  types.ts                # ProfileData, PostData, NoteData, ProfileResponse, ApiError
```

## API Route: `/api/profile`

All external Substack requests go here (avoids CORS on client).

**Input:** `?handle=` accepts bare handle, `@handle`, `https://substack.com/@handle`, or `https://handle.substack.com`

**Flow:**
1. Fetch `https://substack.com/@{handle}` — parse `window._preloads` JSON blob to get profile + user ID
2. Fetch posts + notes in parallel
3. Notes are paginated via cursor (25/page, up to 20 pages, stops at 12-month cutoff or empty page)
4. Sort each by `reactions['❤']`, return top 10 of each

**Substack data sources (undocumented, may break):**
- Profile: `window._preloads` blob in `@handle` page HTML — double-encoded: `JSON.parse(JSON.parse('"' + escaped + '"'))`
- Posts: `https://substack.com/api/v1/profile/posts?profile_user_id={id}&limit=50`
- Notes: `https://substack.com/api/v1/reader/feed/profile/{id}?types=note&limit=25&cursor={cursor}`

## Gotchas

- **`next.config.ts` must exist** — configures `images.remotePatterns` for Substack avatar domains. Without it, `next/image` throws for external URLs.
- **Notes cursor loop** — the notes API returns a `nextCursor` even on empty pages. The route breaks on `items.length === 0` to avoid infinite loops.
- **Notes are `type: "comment"`** in the feed API — filter by `item.type === "comment" && item.comment` before mapping.
- **No path aliases** — use relative imports only (`../types`, `../../../types`).
- **Tailwind v4** — no `tailwind.config.ts`, no `@apply` for custom utilities. Define everything inline or in `globals.css` with `@theme`.
