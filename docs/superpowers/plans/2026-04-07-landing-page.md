# SubScope Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full landing page (sticky navbar, redesigned hero, "Who it's for" two-column section, dark support/CTA section, footer) to SubScope while keeping the existing streaming analytics results UI completely intact.

**Architecture:** Two files change. `layout.tsx` swaps Geist fonts for Playfair Display + DM Sans via CSS variables exposed on `<html>`. `globals.css` registers them as Tailwind utility classes (`font-display`, `font-body`). `page.tsx` gets a full return-statement rewrite — the analytics logic (state, `handleSubmit`) is untouched; only the JSX changes. Landing sections hide automatically when a search is active (`!profile && !loading && !error`).

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, `next/font/google`

---

## File Map

| File | What changes |
|---|---|
| `src/app/layout.tsx` | Remove Geist; add Playfair Display + DM Sans as CSS variables `--font-playfair` / `--font-dm-sans` |
| `src/app/globals.css` | Add `@theme` block registering `font-display` and `font-body` Tailwind utilities |
| `src/app/page.tsx` | Full JSX rewrite (return statement only — state + handleSubmit untouched) |

---

## Task 1: Fonts

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Rewrite `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SubScope — Substack Analytics",
  description: "Analyze any Substack profile: top posts, subscriber counts, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Rewrite `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --font-display: var(--font-playfair);
  --font-body: var(--font-dm-sans);
}
```

`font-display` → Playfair Display. `font-body` → DM Sans. Both are now valid Tailwind utility classes.

- [ ] **Step 3: Verify fonts load**

Check http://localhost:3000 — page still renders (no crash). Open DevTools → Network → filter by "font" — you should see Next.js self-hosting `Playfair_Display` and `DM_Sans` font files under `/_next/static/media/`.

---

## Task 2: Full page.tsx JSX rewrite

**Files:**
- Modify: `src/app/page.tsx`

The analytics logic (all `useState` declarations and the entire `handleSubmit` function) is **not touched**. Only the `return (...)` block is replaced.

- [ ] **Step 1: Replace the entire `return (...)` block**

Find the line `return (` and everything from there to the closing `);` of the return statement (the last `);` before the closing `}` of `Home()`). Replace it with the following complete JSX:

```tsx
  return (
    <div className="min-h-screen bg-[#fdf8f3] flex flex-col font-body">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#fdf8f3] border-b border-[#ede8e0]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-1.5 no-underline">
            <span className="font-display italic font-black text-[#1c1917] text-lg leading-none">
              SubScope
            </span>
            <span className="text-[#e97316] text-base leading-none">✦</span>
          </a>
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
              ☕ Buy me a coffee
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-[#fdf8f3] pt-16 pb-12 px-4">
        {/* Centered hero text */}
        <div className="max-w-2xl mx-auto text-center">
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

          {/* Search form */}
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg mx-auto mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="@handle or substack URL"
              className="flex-1 bg-white border border-[#d6cfc6] rounded-lg px-4 py-3 text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#e97316]/30 focus:border-[#e97316] transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#1c1917] text-white px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-[#292524] transition-colors whitespace-nowrap"
            >
              {loading ? "Loading..." : "Analyze →"}
            </button>
          </form>
          <p className="text-[#a8a29e] text-xs">No login · No tracking · Free forever</p>
        </div>

        {/* Analytics results — conditionally shown after search */}
        {(error || loading || profile) && (
          <div className="max-w-2xl mx-auto mt-10 text-left">

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
        )}
      </section>

      {/* ── Landing sections — hidden while search is active ── */}
      {!profile && !loading && !error && (
        <>
          <hr className="border-[#ede8e0]" />

          {/* Section 1: Who it's for */}
          <section id="how-it-works" className="bg-[#fdf8f3] py-16 px-4">
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
                  <div className="text-2xl mb-3">✍️</div>
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
                  <div className="text-2xl mb-3">🔍</div>
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

          <hr className="border-[#ede8e0]" />

          {/* Section 2: Support */}
          <section className="bg-[#1c1917] py-16 px-4 text-center">
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
                ☕ Buy me a coffee
              </a>
              <p className="text-[#57534e] text-xs mt-4">
                or star it on GitHub — both mean a lot
              </p>
            </div>
          </section>
        </>
      )}

      {/* ── Footer ── */}
      <footer className="bg-[#fdf8f3] border-t border-[#ede8e0] py-6 px-4 mt-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-display italic font-black text-[#78716c] text-sm">SubScope</span>
          <span className="text-[#a8a29e] text-xs">Open source · Made with ♥ · @kaguura</span>
        </div>
      </footer>

    </div>
  );
```

- [ ] **Step 2: Verify the page renders**

Check http://localhost:3000. Expected:
- Sticky navbar: "SubScope ✦" italic serif left, three links right
- Large Playfair Display headline: "Substack has / no analytics. / *Now it does.*" (last line italic orange)
- Styled search box (white rounded input + dark "Analyze →" button)
- "No login · No tracking · Free forever" muted note
- Below: "Who it's for" section with two white cards (Writers / Researchers) with orange `→` bullets
- Dark section: "Built by a creator, *for creators.*" + orange coffee button
- Footer

- [ ] **Step 3: Verify "How it works" smooth scroll**

Click "How it works" in the navbar. The page should scroll down to the "Who it's for" section (it has `id="how-it-works"`).

- [ ] **Step 4: Verify analytics flow still works**

Submit a Substack handle (e.g. `kaguura`). Expected:
1. "Who it's for" and Support sections disappear immediately
2. Loading skeleton shows
3. Profile card + posts stream in
4. Notes scan progress bar appears
5. Notes list populates
All identical to before — just in the new cream-background layout.

---

## Task 3: Lint, commit, push

**Files:** All modified files

- [ ] **Step 1: Run lint**

```bash
cd "d:/PROJECT SWE/subscope/subscope"
npm run lint
```

Expected: no errors. Common issues and fixes:
- `'` in JSX text → already escaped as `&apos;` in the plan above
- Unused imports → check if `Geist`/`Geist_Mono` were fully removed from layout.tsx

- [ ] **Step 2: Commit**

```bash
cd "d:/PROJECT SWE/subscope/subscope"
git add src/app/layout.tsx src/app/globals.css src/app/page.tsx \
  docs/superpowers/plans/2026-04-07-landing-page.md \
  docs/superpowers/specs/2026-04-07-landing-page-design.md \
  .gitignore
git commit -m "$(cat <<'EOF'
feat: landing page — navbar, hero, who-it's-for, support, footer

Warm creator aesthetic: Playfair Display headlines, DM Sans body,
cream #fdf8f3 background, orange #e97316 accent.

- Sticky navbar: italic serif logo, smooth-scroll links, coffee CTA
- Hero: editorial headline 'Substack has no analytics. Now it does.'
  with italic orange accent, styled search box
- 'Who it's for': two-column Writers/Researchers card grid with
  orange arrow bullets; hides when analytics results are active
- Support: dark #1c1917 section, open-source CTA
- Footer: minimal, italic logo left, credit right

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Push**

```bash
git push
```

---

## Color Reference

| Token | Hex | Usage |
|---|---|---|
| Cream bg | `#fdf8f3` | Page background, navbar, hero, footer |
| Stone-900 | `#1c1917` | Primary text, button bg, support section bg |
| Stone-500 | `#78716c` | Secondary text, nav links |
| Stone-400 | `#a8a29e` | Muted text, footer credit |
| Stone-600 | `#57534e` | Support section footnote |
| Border | `#ede8e0` | Dividers, card borders, nav border |
| Card bg | `#ffffff` | Who-it's-for cards |
| Orange accent | `#e97316` | Italic color, arrow bullets, badge, CTA button |
| Orange light bg | `#fff7ed` | Badge bg, coffee pill bg |
| Orange border | `#fed7aa` | Badge border, coffee pill border |
| Orange text | `#ea580c` | Badge text, coffee pill text |
| Orange hover | `#d96d11` | CTA button hover state |
| Input border | `#d6cfc6` | Search box border |
| Support headline | `#fdf8f3` | Headline text on dark section |
