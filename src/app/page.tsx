"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProfileResponse } from "../types";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProfileResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/profile?handle=${encodeURIComponent(val)}`);
      const json = await res.json();
      if (!res.ok) {
        setError((json as { error: string }).error ?? "Something went wrong");
      } else {
        setData(json as ProfileResponse);
      }
    } catch {
      setError("Network error — could not reach server");
    } finally {
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
            {loading ? "Loading…" : "Analyze"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
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

        {/* Results */}
        {data && !loading && (
          <>
            {/* Profile card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                {data.profile.photo_url ? (
                  <Image
                    src={data.profile.photo_url}
                    alt={data.profile.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold shrink-0">
                    {data.profile.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {data.profile.name}
                    </h2>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        data.profile.hasPaidTier
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {data.profile.hasPaidTier ? "Paid" : "Free"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">@{data.profile.handle}</p>
                </div>
              </div>

              {data.profile.bio && (
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {data.profile.bio}
                </p>
              )}

              <div className="flex gap-6 text-sm">
                {data.profile.subscriberCount && (
                  <div>
                    <span className="font-semibold text-gray-900">
                      {data.profile.subscriberCount}
                    </span>
                    <span className="text-gray-500 ml-1">subscribers</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-900">
                    {data.profile.followerCount.toLocaleString()}
                  </span>
                  <span className="text-gray-500 ml-1">followers</span>
                </div>
              </div>
            </div>

            {/* Top posts */}
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Top 10 Posts by Hearts
            </h3>

            {data.topPosts.length === 0 ? (
              <p className="text-gray-500 text-sm mb-8">No posts found.</p>
            ) : (
              <ol className="space-y-2 mb-8">
                {data.topPosts.map((post, i) => (
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

            {/* Top notes */}
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Top 10 Notes by Hearts
            </h3>

            {data.topNotes.length === 0 ? (
              <p className="text-gray-500 text-sm">No notes found.</p>
            ) : (
              <ol className="space-y-2">
                {data.topNotes.map((note, i) => (
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
            )}
          </>
        )}
      </div>
    </main>
  );
}
