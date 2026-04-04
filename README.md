# SubScope

Substack profile analytics. Enter any Substack handle or URL to see subscriber counts, follower counts, top posts, and top notes ranked by heart reactions.

## Features

- **Flexible input** — accepts a bare handle (`kaguuragichuru`), `@handle`, `https://substack.com/@handle`, or `https://handle.substack.com`
- **Profile stats** — name, avatar, bio, subscriber count, follower count, paid/free tier badge
- **Top 10 posts** — sorted by heart reactions, with title, subtitle, restack count, and a direct link
- **Top 10 notes** — sorted by heart reactions, with full note body, restack count, and reply count
- **No CORS issues** — all Substack requests go through a Next.js API route

## How it works

1. The `/api/profile` route fetches `https://substack.com/@{handle}` server-side
2. It parses the `window._preloads` JSON blob embedded in the page HTML to get profile data and the user ID
3. Posts and notes are fetched in parallel:
   - Posts: `https://substack.com/api/v1/profile/posts?profile_user_id={id}&limit=50`
   - Notes: `https://substack.com/api/v1/reader/feed/profile/{id}?types=note&limit=50`
4. Both are sorted by heart count and top 10 of each returned to the client

## Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    page.tsx              # Search UI + results (posts + notes)
    layout.tsx            # Root layout
    globals.css           # Tailwind import
    api/
      profile/
        route.ts          # Server-side Substack fetching + parsing
  types.ts                # Shared TypeScript interfaces
```

## API

### `GET /api/profile?handle=<input>`

`<input>` can be any of:
- `kaguuragichuru`
- `@kaguuragichuru`
- `https://substack.com/@kaguuragichuru`
- `https://kaguura.substack.com`

Returns:

```ts
{
  profile: {
    id: number;
    name: string;
    handle: string;
    photo_url: string | null;
    bio: string | null;
    subscriberCount: string | null;   // e.g. "2.7K+"
    subscriberCountNumber: number | null;
    followerCount: number;
    hasPaidTier: boolean;
  };
  topPosts: Array<{
    title: string;
    subtitle: string | null;
    canonical_url: string;
    heartCount: number;
    restacks: number;
    audience: string;   // "everyone" | "only_paid"
    post_date: string;  // ISO date
  }>;
  topNotes: Array<{
    id: number;
    body: string;
    date: string;       // ISO date
    heartCount: number;
    restacks: number;
    replyCount: number;
  }>;
}
```

## Notes

- Substack does not provide an official public API. This tool relies on the `window._preloads` data blob and undocumented endpoints, which may change without notice.
- Subscriber counts are only shown if the profile makes them public.
- Notes are fetched from the reader feed API and may not include all historical notes if the account has many.
