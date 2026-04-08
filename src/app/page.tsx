"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PrismFluxLoader } from "../components/ui/prism-flux-loader";
import { LimelightNav, NavItem } from "../components/ui/limelight-nav";
import { Heart, Repeat2, MessageCircle, Copy, Check, PenLine, Search, ExternalLink } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}
import { Footer } from "../components/ui/footer";
import { SubstackSearchBox } from "../components/ui/substack-search-box";
import { GLSLHills } from "../components/ui/glsl-hills";
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
  const [sortBy, setSortBy] = useState<"hearts" | "restacks" | "comments">("hearts");
  const [copiedNoteId, setCopiedNoteId] = useState<number | null>(null);

  function copyNote(id: number, body: string) {
    navigator.clipboard.writeText(body).then(() => {
      setCopiedNoteId(id);
      setTimeout(() => setCopiedNoteId(null), 1500);
    });
  }

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
    setSortBy("hearts");

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
    <div className="min-h-screen bg-[#fdf8f3] flex flex-col font-body">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#fdf8f3] border-b border-[#ede8e0]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 no-underline">
            <span className="font-display italic font-black text-[#1c1917] text-lg leading-none">
              SubScope
            </span>
            <span className="text-[#e97316] text-base leading-none">✦</span>
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-[#78716c] text-sm hover:text-[#1c1917] transition-colors no-underline"
            >
              How it works
            </a>
            <a
              href="https://github.com/Deupaxx/subscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#78716c] text-sm hover:text-[#1c1917] transition-colors no-underline"
            >
              GitHub
            </a>
            <a
              href="#"
              className="bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] text-xs font-semibold px-3 py-1.5 rounded no-underline hover:bg-[#ffedd5] transition-colors"
            >
              Buy me a coffee
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-[#fdf8f3] pt-20 pb-16 px-4 overflow-hidden">
        {/* Hills — warm sand ambient texture */}
        <GLSLHills
          color={[0.72, 0.58, 0.44]}
          speed={0.35}
          cameraZ={130}
        />
        {/* Radial vignette — dissolves hills toward edges */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(253,248,243,0.55) 55%, rgba(253,248,243,0.92) 80%, #fdf8f3 100%)",
          }}
        />
        {/* Bottom fade — bleeds into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-10"
          style={{ background: "linear-gradient(to bottom, transparent, #fdf8f3)" }}
        />
        {/* Content */}
        <div className="relative z-20 max-w-2xl mx-auto text-center">
          <div className="inline-block bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-6">
            Substack Analytics
          </div>
          <h1 className="font-display font-black text-[#1c1917] text-4xl sm:text-5xl leading-tight tracking-tight mb-4">
            Substack has<br />
            no analytics.<br />
            <em className="text-[#e97316]">Now it does.</em>
          </h1>
          <p className="text-[#78716c] text-base leading-relaxed mb-8 max-w-md mx-auto">
            Paste any handle and instantly see what&apos;s working — top posts, notes engagement, posting frequency, and audience size.
          </p>
          <SubstackSearchBox
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </section>

      {/* Analytics results — conditionally shown after search */}
      {(error || loading || profile) && (
        <section className="bg-[#fdf8f3] px-4 pb-16">
          <div className="max-w-2xl mx-auto mt-4 text-left">

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
                            <span className="flex items-center gap-1"><Heart size={11} /> {post.heartCount}</span>
                            <span className="flex items-center gap-1"><Repeat2 size={11} /> {post.restacks}</span>
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
                  <div className="mb-6">
                    <PrismFluxLoader
                      size={36}
                      speed={4}
                      statuses={["Scanning notes", "Reading pages", "Sorting hearts", "Fetching data", "Almost there", "Finalizing"]}
                    />
                    {progress && (
                      <p className="text-center text-xs text-[#a8a29e] mt-2">
                        {progress.notesFound} notes found · {progress.pagesScanned} pages scanned
                      </p>
                    )}
                  </div>
                )}

                {/* Top notes — tabbed by sort mode */}
                {topNotes.length > 0 && (() => {
                  const noteNavItems: NavItem[] = [
                    { id: "hearts",   icon: <Heart />,          label: "Hearts"   },
                    { id: "restacks", icon: <Repeat2 />,        label: "Restacks" },
                    { id: "comments", icon: <MessageCircle />,  label: "Comments" },
                  ];
                  const sortMap = { hearts: "heartCount", restacks: "restacks", comments: "replyCount" } as const;
                  const sortedNotes = [...topNotes].sort(
                    (a, b) => b[sortMap[sortBy]] - a[sortMap[sortBy]]
                  );
                  const tabIndex = noteNavItems.findIndex((n) => n.id === sortBy);
                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-900">
                          Top Notes
                        </h3>
                        <LimelightNav
                          items={noteNavItems}
                          defaultActiveIndex={tabIndex}
                          onTabChange={(i) =>
                            setSortBy(noteNavItems[i].id as "hearts" | "restacks" | "comments")
                          }
                          className="bg-[#fdf8f3] border-[#ede8e0]"
                        />
                      </div>
                      <ol className="space-y-2">
                        {sortedNotes.map((note, i) => (
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
                                <span className={`flex items-center gap-1 ${sortBy === "hearts" ? "text-[#e97316] font-semibold" : ""}`}>
                                  <Heart size={11} /> {note.heartCount}
                                </span>
                                <span className={`flex items-center gap-1 ${sortBy === "restacks" ? "text-[#e97316] font-semibold" : ""}`}>
                                  <Repeat2 size={11} /> {note.restacks}
                                </span>
                                {note.replyCount > 0 && (
                                  <span className={`flex items-center gap-1 ${sortBy === "comments" ? "text-[#e97316] font-semibold" : ""}`}>
                                    <MessageCircle size={11} /> {note.replyCount}
                                  </span>
                                )}
                                <span className="ml-auto flex items-center gap-2">
                                  <span>{new Date(note.date).toLocaleDateString()}</span>
                                  <button
                                    onClick={() => copyNote(note.id, note.body)}
                                    title="Copy note"
                                    className="text-gray-300 hover:text-gray-500 transition-colors"
                                  >
                                    {copiedNoteId === note.id
                                      ? <Check size={12} className="text-green-500" />
                                      : <Copy size={12} />
                                    }
                                  </button>
                                  <a
                                    href={note.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="View on Substack"
                                    className="text-gray-300 hover:text-gray-500 transition-colors"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </>
                  );
                })()}

                {/* No notes found (after scanning completes) */}
                {!scanningNotes && topNotes.length === 0 && (
                  <p className="text-gray-500 text-sm">No notes found.</p>
                )}
              </>
            )}

          </div>
        </section>
      )}

      {/* ── Landing sections — hidden while search is active ── */}
      {!profile && !loading && !error && (
        <>
          {/* Section 1: Who it's for */}
          <section id="how-it-works" className="bg-[#fdf8f3] pt-16 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-[#e97316] text-xs font-bold tracking-widest uppercase mb-3">
                Who it&apos;s for
              </p>
              <h2 className="font-display font-black text-[#1c1917] text-3xl leading-tight mb-3">
                Two ways to use <em>SubScope</em>
              </h2>
              <p className="text-[#78716c] text-sm leading-relaxed mb-10">
                Whether you&apos;re a writer or a curious reader, the data tells a story.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Writers card */}
                <div className="bg-white border border-[#ede8e0] rounded-xl p-6">
                  <div className="mb-3"><PenLine className="h-6 w-6 text-[#e97316]" /></div>
                  <h3 className="font-display font-bold text-[#1c1917] text-xl mb-2">
                    For Writers
                  </h3>
                  <p className="text-[#78716c] text-sm leading-relaxed mb-5">
                    Audit your own performance and understand what actually resonates with your audience.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Which posts got the most hearts",
                      "How consistent your output is",
                      "Your best notes by engagement",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#78716c]">
                        <span className="text-[#e97316] font-bold shrink-0 mt-0.5">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Researchers card */}
                <div className="bg-white border border-[#ede8e0] rounded-xl p-6">
                  <div className="mb-3"><Search className="h-6 w-6 text-[#e97316]" /></div>
                  <h3 className="font-display font-bold text-[#1c1917] text-xl mb-2">
                    For Researchers
                  </h3>
                  <p className="text-[#78716c] text-sm leading-relaxed mb-5">
                    Understand any writer on the platform — who&apos;s building something real vs. coasting on numbers.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Compare engagement to audience size",
                      "See publishing frequency over 6 months",
                      "Spot the notes that actually land",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#78716c]">
                        <span className="text-[#e97316] font-bold shrink-0 mt-0.5">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Support */}
          <section className="bg-[#1c1917] py-24 px-4 text-center">
            <div className="max-w-lg mx-auto">
              <h2 className="font-display font-black text-[#fdf8f3] text-3xl leading-tight mb-4">
                Built by a creator,<br />
                <em className="text-[#e97316]">for creators.</em>
              </h2>
              <p className="text-[#a8a29e] text-sm leading-relaxed mb-8">
                SubScope is free and open source. If it&apos;s saved you time or helped you understand your audience, a coffee goes a long way.
              </p>
              <a
                href="#"
                className="inline-block bg-[#e97316] text-white font-bold px-8 py-3 rounded-lg text-sm hover:bg-[#d96d11] transition-colors no-underline"
              >
                Buy me a coffee
              </a>
              <p className="text-[#57534e] text-xs mt-4">
                or star it on GitHub — both mean a lot
              </p>
            </div>
          </section>
        </>
      )}

      {/* ── Footer ── */}
      <Footer
        className="bg-[#1c1917]"
        logo={
          <span className="flex items-center gap-1.5">
            <span className="font-display italic font-black text-[#fdf8f3] text-lg leading-none">
              SubScope
            </span>
            <span className="text-[#e97316] text-base leading-none">✦</span>
          </span>
        }
        brandName="SubScope"
        socialLinks={[
          {
            icon: <GithubIcon className="h-4 w-4" />,
            href: "https://github.com/Deupaxx/subscope",
            label: "GitHub",
          },
        ]}
        mainLinks={[
          { href: "#how-it-works", label: "How it works" },
          {
            href: "https://github.com/Deupaxx/subscope",
            label: "GitHub",
            external: true,
          },
          { href: "#", label: "Buy me a coffee", external: true },
        ]}
        legalLinks={[
          { href: "/terms", label: "Terms & Conditions" },
          { href: "https://github.com/Deupaxx/subscope/blob/main/LICENSE", label: "MIT License" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} SubScope`,
          license: "Open source · Built by @deupaxx",
        }}
      />

    </div>
  );
}
