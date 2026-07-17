import type { Metadata } from "next";
import Link from "next/link";
import { Clapperboard } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipForge — YouTube to Shorts, automated",
  description:
    "Import or upload videos, auto-caption and translate, add copyright-free music, and browse a topic-grouped catalog. Free, open-source, self-configurable AI.",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/catalog", label: "Catalog" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Clapperboard className="h-5 w-5 text-primary" />
              ClipForge
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="container py-10">{children}</main>
        <footer className="border-t py-6">
          <div className="container text-xs text-muted-foreground">
            ClipForge · lightweight, extensible, free-AI shorts automation
          </div>
        </footer>
      </body>
    </html>
  );
}
