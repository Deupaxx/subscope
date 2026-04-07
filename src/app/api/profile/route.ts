import { NextRequest, NextResponse } from "next/server";
import type { ProfileData, PostData, NoteData, ApiError, Stats } from "../../../types";

export const maxDuration = 60;

function extractPreloads(html: string): Record<string, unknown> {
  const idx = html.indexOf('JSON.parse("');
  if (idx === -1) throw new Error("Could not find _preloads in page HTML");
  const start = idx + 12;

  // Walk forward to find the first unescaped `")` — the closing delimiter.
  let end = -1;
  let pos = start;
  while (pos < html.length) {
    const q = html.indexOf('")', pos);
    if (q === -1) break;
    let backslashes = 0;
    let i = q - 1;
    while (i >= 0 && html[i] === '\\') { backslashes++; i--; }
    if (backslashes % 2 === 0) { end = q; break; }
    pos = q + 1;
  }

  if (end === -1) throw new Error("Could not find end of _preloads JSON");
  const escaped = html.slice(start, end);
  return JSON.parse(JSON.parse('"' + escaped + '"')) as Record<string, unknown>;
}

function parseHandle(input: string): string | null {
  input = input.trim();

  let url: URL | null = null;
  try {
    const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    url = new URL(withProtocol);
  } catch {
    // Not a URL — treat as plain handle
  }

  if (url) {
    const atMatch = url.pathname.match(/^\/@([a-zA-Z0-9_-]+)/);
    if (atMatch) return atMatch[1];

    const subdomainMatch = url.hostname.match(/^([a-zA-Z0-9_-]+)\.substack\.com$/);
    if (subdomainMatch) return subdomainMatch[1];

    return null;
  }

  const clean = input.replace(/^@/, "");
  if (/^[a-zA-Z0-9_-]+$/.test(clean)) return clean;
  return null;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function GET(
  request: NextRequest
): Promise<Response | NextResponse<ApiError>> {
  const raw = request.nextUrl.searchParams.get("handle")?.trim() ?? "";
  const handle = parseHandle(raw);

  if (!handle) {
    return NextResponse.json(
      { error: "Invalid handle or URL. Try 'username', '@username', or a Substack URL." },
      { status: 400 }
    );
  }

  // 1. Fetch the Substack profile page
  let html: string;
  try {
    const res = await fetch(`https://substack.com/@${handle}`, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
    });
    if (res.status === 404) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `Substack returned ${res.status}` },
        { status: 502 }
      );
    }
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "Failed to reach Substack" }, { status: 502 });
  }

  // 2. Parse window._preloads
  let preloads: Record<string, unknown>;
  try {
    preloads = extractPreloads(html);
  } catch {
    return NextResponse.json(
      { error: "Could not parse Substack profile data" },
      { status: 502 }
    );
  }

  const rawProfile = preloads.profile as Record<string, unknown> | null;
  if (!rawProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const userId = rawProfile.id as number;
  const primaryPub = rawProfile.primaryPublication as Record<string, unknown> | null;
  const hasPaidTier = !!(
    primaryPub?.paid_subscription_benefit_title ||
    (rawProfile.max_pub_tier && rawProfile.max_pub_tier !== "free")
  );

  const profile: ProfileData = {
    id: userId,
    name: rawProfile.name as string,
    handle: rawProfile.handle as string,
    photo_url: (rawProfile.photo_url as string | null) ?? null,
    bio: (rawProfile.bio as string | null) ?? null,
    subscriberCount: (rawProfile.subscriberCount as string | null) ?? null,
    subscriberCountNumber: (rawProfile.subscriberCountNumber as number | null) ?? null,
    followerCount: (rawProfile.followerCount as number) ?? 0,
    hasPaidTier,
  };

  // 3. Stream response: profile+posts first, then notes progressively
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      }

      // Fetch posts (fast, single request)
      let topPosts: PostData[] = [];
      try {
        const postsRes = await fetch(
          `https://substack.com/api/v1/profile/posts?profile_user_id=${userId}&limit=50`,
          { headers: { "User-Agent": UA }, cache: "no-store" }
        );
        if (postsRes.ok) {
          const postsJson = (await postsRes.json()) as { posts: Record<string, unknown>[] };
          topPosts = (postsJson.posts ?? [])
            .map((p) => ({
              title: (p.title as string) ?? "(untitled)",
              subtitle: (p.subtitle as string | null) ?? null,
              canonical_url: p.canonical_url as string,
              heartCount: ((p.reactions as Record<string, number> | null)?.["❤"] ?? 0),
              restacks: (p.restacks as number) ?? 0,
              audience: (p.audience as string) ?? "everyone",
              post_date: p.post_date as string,
            }))
            .sort((a, b) => b.heartCount - a.heartCount)
            .slice(0, 10);
        }
      } catch {
        // posts failed — continue with empty
      }

      // Send profile + posts immediately
      send({ type: "profile", profile, topPosts });

      // 4. Fetch notes with corrected filter logic
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 6);

      const allNotes: Record<string, unknown>[] = [];
      let cursor: string | null = null;
      const MAX_PAGES = 200;

      for (let page = 0; page < MAX_PAGES; page++) {
        const url =
          `https://substack.com/api/v1/reader/feed/profile/${userId}?types=note&limit=25` +
          (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "");

        let json: { items: Record<string, unknown>[]; nextCursor: string | null };
        try {
          const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
          if (!res.ok) break;
          json = await res.json() as typeof json;
        } catch {
          break;
        }

        const items = json.items ?? [];
        if (items.length === 0) break;

        let reachedCutoff = false;
        for (const item of items) {
          // Only process actual notes (type: "comment"), skip reposts/restacks/etc.
          if ((item.type as string) !== "comment" || !item.comment) continue;

          const c = item.comment as Record<string, unknown>;
          const date = c.date as string | null;
          if (date && new Date(date) < cutoff) { reachedCutoff = true; break; }
          allNotes.push(item);
        }

        // Send progress every 5 pages
        if ((page + 1) % 5 === 0) {
          send({ type: "progress", pagesScanned: page + 1, notesFound: allNotes.length });
        }

        if (reachedCutoff || !json.nextCursor) break;
        cursor = json.nextCursor;
      }

      // 5. Map, sort, and compute stats
      const topNotes: NoteData[] = allNotes
        .map((item) => {
          const c = (item as Record<string, unknown>).comment as Record<string, unknown>;
          return {
            id: c.id as number,
            body: (c.body as string) ?? "",
            date: (c.date as string) ?? "",
            heartCount: (c.reaction_count as number) ?? 0,
            restacks: (c.restacks as number) ?? 0,
            replyCount: (c.children_count as number) ?? 0,
          };
        })
        .sort((a, b) => b.heartCount - a.heartCount)
        .slice(0, 20);

      const threeMoCutoff = new Date();
      threeMoCutoff.setMonth(threeMoCutoff.getMonth() - 3);

      const postsLast3Months = topPosts.filter((p) => {
        return p.post_date && new Date(p.post_date) >= threeMoCutoff;
      }).length;

      const stats: Stats = {
        notesLast6Months: allNotes.length,
        postsLast3Months,
        avgDailyNotes: parseFloat((allNotes.length / 182).toFixed(2)),
        avgWeeklyPosts: parseFloat((postsLast3Months / 13).toFixed(2)),
      };

      // Send final chunk
      send({ type: "complete", topNotes, stats });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache, no-store",
      "Transfer-Encoding": "chunked",
    },
  });
}
