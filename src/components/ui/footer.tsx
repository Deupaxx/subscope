import Link from "next/link";
import { Button } from "./button";

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
    <footer className={`pb-8 pt-14 ${className ?? ""}`}>
      <div className="px-6 lg:px-10 max-w-5xl mx-auto">
        {/* Top row: logo left, social icons right */}
        <div className="md:flex md:items-start md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-x-2 no-underline"
            aria-label={brandName}
          >
            {logo}
          </Link>
          <ul className="flex list-none mt-5 md:mt-0 space-x-2">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  asChild
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider + bottom nav grid */}
        <div className="border-t border-[#ede8e0] mt-6 pt-6 md:mt-5 md:pt-7 lg:grid lg:grid-cols-10">
          {/* Main links */}
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1c1917] underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-[#1c1917] underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal links */}
          {legalLinks.length > 0 && (
            <div className="mt-4 lg:mt-0 lg:col-[4/11]">
              <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
                {legalLinks.map((link, i) => (
                  <li key={i} className="my-1 mx-3 shrink-0">
                    <a
                      href={link.href}
                      className="text-sm text-[#78716c] underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Copyright */}
          <div className="mt-6 text-sm leading-6 text-[#a8a29e] whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
            <div>{copyright.text}</div>
            {copyright.license && (
              <div className="text-[#78716c]">{copyright.license}</div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
