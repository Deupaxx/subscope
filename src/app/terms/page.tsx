import Link from "next/link";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export default function TermsPage() {
  const sections: { id: string; heading: string; body: React.ReactNode }[] = [
    {
      id: "how-it-works",
      heading: "How SubScope Works",
      body: (
        <>
          <p>
            SubScope accesses publicly available data that is already visible to any visitor on
            Substack&apos;s platform — no account required. We interact with the same endpoints a
            browser uses when someone visits a Substack profile page.
          </p>
          <p>
            We do not crawl, index, or store content in bulk. We do not access paywalled or
            subscriber-only content. Each lookup is triggered manually by a user and is equivalent
            to visiting that profile page in a browser.
          </p>
          <p>
            SubScope is not a scraper in the traditional sense. It is a read-once, display-once
            tool. Nothing is retained after the session ends.
          </p>
        </>
      ),
    },
    {
      id: "responsible-use",
      heading: "Responsible Use",
      body: (
        <>
          <p>
            SubScope is designed to be used responsibly. The tool processes one profile at a time,
            does not support bulk lookups, and does not cache or redistribute Substack content.
          </p>
          <p>
            We actively limit request volume to avoid placing any unreasonable load on third-party
            infrastructure. If you attempt to use SubScope in an automated or abusive manner, we
            reserve the right to block access.
          </p>
        </>
      ),
    },
    {
      id: "platform-disclaimer",
      heading: "Platform Disclaimer",
      body: (
        <p>
          SubScope is an independent tool and is not affiliated with, endorsed by, or in any way
          connected to Substack Inc. We have no relationship with Substack and do not speak on their
          behalf. All trademarks, product names, and company names mentioned are the property of
          their respective owners.
        </p>
      ),
    },
    {
      id: "copy",
      heading: "The Copy Feature",
      body: (
        <>
          <p>
            SubScope includes a one-click copy button that lets you copy the text of a note for
            reference. This feature is intended strictly for research, personal study, and creative
            inspiration.
          </p>
          <p>
            Copying another writer&apos;s work and publishing it as your own is plagiarism. SubScope
            does not condone this and accepts no responsibility for how users choose to use content
            accessed through the tool.
          </p>
        </>
      ),
    },
    {
      id: "grades",
      heading: "Engagement Grades",
      body: (
        <>
          <p>
            The S / A / B / C engagement scoring system is an algorithmic estimate based on publicly
            available metrics such as hearts, restacks, and follower count. It reflects post-level
            engagement ratios — nothing more.
          </p>
          <p>
            These grades are not an authoritative judgment of a writer&apos;s quality, value, or
            potential. Use them as a rough signal, not a verdict.
          </p>
        </>
      ),
    },
    {
      id: "fairuse",
      heading: "Fair Use & Opt-Out",
      body: (
        <>
          <p>
            SubScope is built for educational and analytical purposes under fair use principles. It
            does not reproduce or redistribute Substack content — it surfaces publicly available
            metrics in an aggregated, analytical format.
          </p>
          <p>
            If you are a Substack writer and want your public profile excluded from SubScope
            results, contact us at{" "}
            <a
              href="mailto:hello@subscope.app"
              className="text-[#e97316] hover:underline"
            >
              hello@subscope.app
            </a>{" "}
            and we will action that request promptly.
          </p>
        </>
      ),
    },
    {
      id: "accuracy",
      heading: "No Guarantees",
      body: (
        <>
          <p>
            SubScope displays data as-is, pulled in real time from Substack&apos;s public endpoints.
            We do not guarantee accuracy, completeness, or freshness. Numbers may lag, miss edge
            cases, or reflect Substack&apos;s own rounding and filtering.
          </p>
          <p>
            Substack may change their platform, API, or page structure at any time, which could
            affect how SubScope functions or the reliability of the data shown.
          </p>
        </>
      ),
    },
    {
      id: "liability",
      heading: "Liability",
      body: (
        <p>
          SubScope is provided as-is with no warranties, express or implied. We are not liable for
          any decisions, actions, or consequences arising from the use of data shown in this tool.
          Use your own judgment.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "Changes to These Terms",
      body: (
        <p>
          We reserve the right to update these terms at any time. Continued use of SubScope after
          changes are posted means you accept the updated terms.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f3] flex flex-col font-body">

      {/* Minimal nav */}
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
              href="https://github.com/Deupaxx/subscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#78716c] hover:text-[#1c1917] transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <header className="max-w-2xl mx-auto w-full px-4 pt-16 pb-10">
        <p className="text-[#e97316] text-xs font-bold tracking-widest uppercase mb-3">
          Legal
        </p>
        <h1 className="font-display font-black text-[#1c1917] text-4xl leading-tight tracking-tight mb-3">
          Terms of Use
        </h1>
        <p className="text-[#78716c] text-sm">
          Last updated: April 2026
        </p>
      </header>

      {/* Divider */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <div className="border-t border-[#ede8e0]" />
      </div>

      {/* Sections */}
      <main className="max-w-2xl mx-auto w-full px-4 py-12 space-y-10 flex-1">
        {sections.map((s) => (
          <section key={s.id} id={s.id}>
            <h2 className="font-display font-bold text-[#1c1917] text-xl mb-3">
              {s.heading}
            </h2>
            <div className="space-y-3 text-sm text-[#57534e] leading-relaxed">
              {s.body}
            </div>
          </section>
        ))}
      </main>

      {/* Bottom bar */}
      <footer className="border-t border-[#ede8e0] py-6 px-4">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[#a8a29e]">
            &copy; {new Date().getFullYear()} SubScope &mdash; Open source
          </p>
          <Link
            href="/"
            className="text-xs text-[#e97316] hover:underline no-underline font-medium"
          >
            &larr; Back to SubScope
          </Link>
        </div>
      </footer>

    </div>
  );
}
