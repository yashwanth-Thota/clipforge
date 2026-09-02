import type { Metadata } from "next";
import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipForge — YouTube to Shorts, automated",
  description:
    "Import or upload videos, auto-caption and translate, add copyright-free music, and browse a topic-grouped catalog. Free, open-source, self-configurable AI.",
};

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
            <SiteNav />
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
