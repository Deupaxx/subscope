import { NextRequest, NextResponse } from "next/server";
import type { ProfileData, PostData, NoteData, ProfileResponse, ApiError } from "../../../types";

function extractPreloads(html: string): Record<string, unknown> {
  const idx = html.indexOf('JSON.parse("');
  if (idx === -1) throw new Error("Could not find _preloads in page HTML");
  const start = idx + 12;
  const end = html.indexOf('")', start);
  if (end === -1) throw new Error("Could not find end of _preloads JSON");
  const escaped = html.slice(start, end);
  // The HTML embeds a double-encoded JSON string: JSON.parse("...escaped...")
  return JSON.parse(JSON.parse('"' + escaped + '"')) as Record<string, unknown>;
}

/**
 * Accepts a raw user input — either a handle ("kaguuragichuru", "@kaguuragichuru")
 * or a Substack URL ("https://substack.com/@kaguuragichuru",
 * "https://kaguura.substack.com", etc.) and returns just the handle string.
 */
function parseHandle(input: string): string | null {
  input = input.trim();

  // Try URL parse first
  let url: URL | null = null;
  try {
    // Prepend https:// if no protocol provided but looks like a URL
    const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    url = new URL(withProtocol);
  } catch {
    // Not a URL — treat as plain handle
  }

  if (url) {
    // https://substack.com/@handle
    const atMatch = url.pathname.match(/^\/@([a-zA-Z0-9_-]+)/);
    if (atMatch) return atMatch[1];

    // https://handle.substack.com  or  https://handle.substack.com/...
    const subdomainMatch = url.hostname.match(/^([a-zA-Z0-9_-]+)\.substack\.com$/);
    if (subdomainMatch) return subdomainMatch[1];

    return null;
  }

  // Plain handle — strip leading @
  const clean = input.replace(/^@/, "");
  if (/^[a-zA-Z0-9_-]+$/.test(clean)) return clean;
  return null;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ProfileResponse | ApiError>> {
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

  // 3. Fetch posts and notes in parallel
  // Notes are paginated — we walk cursor pages until we exceed 12 months or run out
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  async function fetchAllNotes(): Promise<Record<string, unknown>[]> {
    const all: Record<string, unknown>[] = [];
    let cursor: string | null = null;
    const MAX_PAGES = 20; // safety cap (~500 notes max)

    for (let page = 0; page < MAX_PAGES; page++) {
      const url =
        `https://substack.com/api/v1/reader/feed/profile/${userId}?types=note&limit=25` +
        (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "");

      const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
      if (!res.ok) break;

      const json = (await res.json()) as {
        items: Record<string, unknown>[];
        nextCursor: string | null;
      };

      const items = json.items ?? [];
      let reachedCutoff = false;

      for (const item of items) {
        const c = item.comment as Record<string, unknown> | null;
        const date = c?.date as string | null;
        if (date && new Date(date) < cutoff) {
          reachedCutoff = true;
          break;
        }
        all.push(item);
      }

      if (reachedCutoff || !json.nextCursor || items.length === 0) break;
      cursor = json.nextCursor;
    }

    return all;
  }

  const [postsResult, notesResult] = await Promise.allSettled([
    fetch(
      `https://substack.com/api/v1/profile/posts?profile_user_id=${userId}&limit=50`,
      { headers: { "User-Agent": UA }, cache: "no-store" }
    ).then((r) => {
      if (!r.ok) throw new Error(`Posts API returned ${r.status}`);
      return r.json() as Promise<{ posts: Record<string, unknown>[] }>;
    }),
    fetchAllNotes(),
  ]);

  if (postsResult.status === "rejected") {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 502 });
  }

  // 4. Map and sort posts
  const topPosts: PostData[] = (postsResult.value.posts ?? [])
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

  // 5. Map and sort notes (gracefully empty if API failed)
  const rawNotes = notesResult.status === "fulfilled" ? notesResult.value : [];

  const topNotes: NoteData[] = rawNotes
    .filter((item) => (item.type as string) === "comment" && item.comment)
    .map((item) => {
      const c = item.comment as Record<string, unknown>;
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
    .slice(0, 10);

  return NextResponse.json({ profile, topPosts, topNotes });
}
