"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProfileData, PostData, NoteData, Stats, StreamChunk } from "../types";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Streamed state — populated progressively
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [topPosts, setTopPosts] = useState<PostData[]>([]);
  const [topNotes, setTopNotes] = useState<NoteData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState<{ pagesScanned: number; notesFound: number } | null>(null);
  const [scanningNotes, setScanningNotes] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;

    setLoading(true);
    setError(null);
    setProfile(null);
    setTopPosts([]);
    setTopNotes([]);
    setStats(null);
    setProgress(null);
    setScanningNotes(false);

    try {
      const res = await fetch(`/api/profile?handle=${encodeURIComponent(val)}`);

      // Non-streamed error response (JSON)
      if (!res.ok) {
        const json = await res.json();
        setError((json as { error: string }).error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      // Streamed NDJSON response
      const reader = res.body?.getReader();
      if (!reader) {
        setError("Browser does not support streaming responses");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete last line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line) as StreamChunk;
            switch (chunk.type) {
              case "profile":
                setProfile(chunk.profile);
                setTopPosts(chunk.topPosts);
                setLoading(false); // profile is loaded, show it
                setScanningNotes(true);
                break;
              case "progress":
                setProgress({ pagesScanned: chunk.pagesScanned, notesFound: chunk.notesFound });
                break;
              case "complete":
                setTopNotes(chunk.topNotes);
                setStats(chunk.stats);
                setScanningNotes(false);
                setProgress(null);
                break;
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch {
      setError("Network error — could not reach server");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">SubScope</h1>
        <p className="text-gray-500 text-sm mb-8">Substack profile analytics</p>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Handle, @handle, or Substack URL"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {loading ? "Loading..." : "Analyze"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton — only shown before profile arrives */}
        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        )}

        {/* Profile card — renders as soon as profile chunk arrives */}
        {profile && (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                {profile.photo_url ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold shrink-0">
                    {profile.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {profile.name}
                    </h2>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        profile.hasPaidTier
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {profile.hasPaidTier ? "Paid" : "Free"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">@{profile.handle}</p>
                </div>
              </div>

              {profile.bio && (
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex gap-6 text-sm flex-wrap">
                {profile.subscriberCount && (
                  <div>
                    <span className="font-semibold text-gray-900">
                      {profile.subscriberCount}
                    </span>
                    <span className="text-gray-500 ml-1">subscribers</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-900">
                    {profile.followerCount.toLocaleString()}
                  </span>
                  <span className="text-gray-500 ml-1">followers</span>
                </div>
              </div>

              {/* Activity stats — shown when complete chunk arrives */}
              {stats && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="bg-gray-50 rounded-md px-3 py-2">
                    <p className="text-lg font-semibold text-gray-900">{stats.notesLast6Months}</p>
                    <p className="text-xs text-gray-500">notes (6 mo)</p>
                  </div>
                  <div className="bg-gray-50 rounded-md px-3 py-2">
                    <p className="text-lg font-semibold text-gray-900">{stats.postsLast3Months}</p>
                    <p className="text-xs text-gray-500">posts (3 mo)</p>
                  </div>
                  <div className="bg-gray-50 rounded-md px-3 py-2">
                    <p className="text-lg font-semibold text-gray-900">{stats.avgDailyNotes}</p>
                    <p className="text-xs text-gray-500">avg notes/day</p>
                  </div>
                  <div className="bg-gray-50 rounded-md px-3 py-2">
                    <p className="text-lg font-semibold text-gray-900">{stats.avgWeeklyPosts}</p>
                    <p className="text-xs text-gray-500">avg posts/week</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top posts */}
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Top 10 Posts by Hearts
            </h3>

            {topPosts.length === 0 ? (
              <p className="text-gray-500 text-sm mb-8">No posts found.</p>
            ) : (
              <ol className="space-y-2 mb-8">
                {topPosts.map((post, i) => (
                  <li
                    key={post.canonical_url}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-4 flex gap-3 items-start"
                  >
                    <span className="text-gray-400 text-sm font-mono w-5 pt-0.5 shrink-0 text-right">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={post.canonical_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 block leading-snug"
                      >
                        {post.title}
                      </a>
                      {post.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {post.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>❤ {post.heartCount}</span>
                        <span>🔁 {post.restacks}</span>
                        {post.audience === "only_paid" && (
                          <span className="text-amber-600 font-medium">Paid</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {/* Notes scanning progress */}
            {scanningNotes && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-md px-4 py-3 mb-6 text-sm flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scanning notes...
                {progress && (
                  <span className="ml-1">
                    ({progress.notesFound} notes found, {progress.pagesScanned} pages scanned)
                  </span>
                )}
              </div>
            )}

            {/* Top notes */}
            {topNotes.length > 0 && (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Top 20 Notes by Hearts
                </h3>
                <ol className="space-y-2">
                  {topNotes.map((note, i) => (
                    <li
                      key={note.id}
                      className="bg-white border border-gray-200 rounded-lg px-4 py-4 flex gap-3 items-start"
                    >
                      <span className="text-gray-400 text-sm font-mono w-5 pt-0.5 shrink-0 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                          {note.body}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>❤ {note.heartCount}</span>
                          <span>🔁 {note.restacks}</span>
                          {note.replyCount > 0 && (
                            <span>💬 {note.replyCount}</span>
                          )}
                          <span className="ml-auto">
                            {new Date(note.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {/* No notes found (after scanning completes) */}
            {!scanningNotes && topNotes.length === 0 && (
              <p className="text-gray-500 text-sm">No notes found.</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
