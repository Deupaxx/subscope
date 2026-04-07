import Link from "next/link";

interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
    external?: boolean;
  }>;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
  className?: string;
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
  className,
}: FooterProps) {
  return (
    <footer className={`w-full ${className ?? ""}`}>
      {/* Thin rule to separate from support section content */}
      <div className="mx-6 lg:mx-10 border-t border-white/[0.08]" />

      <div className="px-6 lg:px-10 max-w-5xl mx-auto py-10">
        {/* Single row: logo · nav links · social */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-x-2 no-underline shrink-0"
            aria-label={brandName}
          >
            {logo}
          </Link>

          {/* Nav links — centered on desktop */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {mainLinks.map((link, i) =>
              link.external ? (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#57534e] hover:text-[#a8a29e] transition-colors no-underline"
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={i}
                  href={link.href}
                  className="text-sm text-[#57534e] hover:text-[#a8a29e] transition-colors no-underline"
                >
                  {link.label}
                </a>
              )
            )}
            {legalLinks.map((link, i) => (
              <a
                key={`legal-${i}`}
                href={link.href}
                className="text-sm text-[#3d3935] hover:text-[#57534e] transition-colors no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-2 shrink-0">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="flex items-center justify-center h-8 w-8 rounded-full text-[#57534e] hover:text-[#a8a29e] hover:bg-white/5 transition-all"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright — below, subtle */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-xs text-[#3d3935]">{copyright.text}</p>
          {copyright.license && (
            <p className="text-xs text-[#3d3935]">{copyright.license}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
