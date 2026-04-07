# SubScope ✦

Free, open-source analytics for any Substack profile. Paste a handle or URL and instantly see top posts, top notes, and 6-month activity stats — streamed progressively as data arrives.

**Live:** [subscope on GitHub](https://github.com/Deupaxx/subscope)

---

## Features

- **Flexible input** — bare handle, `@handle`, `substack.com/@handle`, or `handle.substack.com`
- **Profile card** — name, avatar, bio, subscriber count, follower count, paid/free badge
- **Top 10 posts** — by heart reactions, with subtitle, restack count, paid badge, direct link
- **Top 20 notes** — sortable by ❤ Hearts / 🔁 Restacks / 💬 Comments via limelight tab nav
- **6-month activity stats** — notes last 6 months, posts last 3 months, avg daily notes, avg weekly posts
- **Streaming UI** — results appear progressively via NDJSON stream; 3D cube loader during notes scan
- **No login · No tracking · Free forever**

---

## How it works

The `/api/profile` route streams three NDJSON chunks to the client in order:

| Chunk | When sent | Contains |
|---|---|---|
| `profile` | After profile page is scraped | Profile data + top 50 posts |
| `progress` | Every 5 pages of notes | `pagesScanned`, `notesFound` |
| `complete` | After all notes collected | Top 20 notes + activity stats |

### Scraping strategy

1. Fetches `substack.com/@{handle}` and parses the inline `window._preloads` JSON blob for profile data and user ID
2. Posts come from `substack.com/api/v1/profile/posts?profile_user_id={id}&limit=50`
3. Notes come from `substack.com/api/v1/reader/feed/profile/{id}?types=note` — cursor-paginated up to 200 pages, stopping early when notes older than 6 months are reached. Only `type: "comment"` items are counted (restacks/reposts are skipped)

All Substack requests are made server-side to avoid CORS. A Chrome User-Agent is set on every request.

---

## Stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, webpack mode) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Playfair Display / DM Sans (`next/font/google`) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| UI primitives | [@radix-ui/react-tooltip](https://www.radix-ui.com/) |

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

> **Note:** The dev script runs `next dev --webpack` to avoid a Turbopack bug with paths that contain spaces on Windows. If your path has no spaces, you can remove `--webpack`.

---

## Project structure

```
src/
  app/
    page.tsx                    # Landing page + analytics UI (client component)
    layout.tsx                  # Root layout — Playfair Display + DM Sans fonts
    globals.css                 # Tailwind import + @theme font/color tokens
    api/
      profile/
        route.ts                # Streaming NDJSON handler (maxDuration = 60)
  components/
    ui/
      substack-search-box.tsx   # Dark pill search input (framer-motion animated)
      prism-flux-loader.tsx     # 3D rotating cube loader (notes scan animation)
      limelight-nav.tsx         # Sliding limelight tab nav (notes sort selector)
  types.ts                      # StreamChunk discriminated union + shared types
```

---

## API

### `GET /api/profile?handle=<input>`

Accepts any of:
- `deupaxx`
- `@deupaxx`
- `https://substack.com/@deupaxx`
- `https://deupaxx.substack.com`

Returns a streaming NDJSON response (`Content-Type: application/x-ndjson`). Each line is a JSON object with a `type` discriminant:

```ts
// Chunk 1 — sent immediately
{ type: "profile"; profile: ProfileData; topPosts: PostData[] }

// Chunk 2 — sent every 5 pages during notes pagination
{ type: "progress"; pagesScanned: number; notesFound: number }

// Chunk 3 — sent when all notes are collected
{ type: "complete"; topNotes: NoteData[]; stats: Stats }
```

**Types:**

```ts
type ProfileData = {
  id: number;
  name: string;
  handle: string;
  photo_url: string | null;
  bio: string | null;
  subscriberCount: string | null;       // e.g. "2.7K+"
  subscriberCountNumber: number | null;
  followerCount: number;
  hasPaidTier: boolean;
};

type PostData = {
  title: string;
  subtitle: string | null;
  canonical_url: string;
  heartCount: number;
  restacks: number;
  audience: "everyone" | "only_paid";
  post_date: string;                    // ISO date
};

type NoteData = {
  id: number;
  body: string;
  date: string;                         // ISO date
  heartCount: number;
  restacks: number;
  replyCount: number;
};

type Stats = {
  notesLast6Months: number;
  postsLast3Months: number;
  avgDailyNotes: string;                // e.g. "0.4"
  avgWeeklyPosts: string;               // e.g. "1.2"
};
```

---

## Caveats

- Substack has no official public API. This tool relies on `window._preloads` and undocumented endpoints that may change without notice.
- Subscriber counts are only shown when the profile makes them public.
- Notes pagination scans up to 200 pages; very prolific writers may have older notes not included.
- Built by [@deupaxx](https://github.com/Deupaxx) — contributions welcome.
