"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/read")) {
    return null;
  }

  return (
    <footer className="border-t border-white/[0.08] bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="inline-block mb-3 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-md"
              aria-label="Ilovecomix Home"
            >
              <Logo className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-zinc-400 text-xs max-w-sm leading-relaxed">
              High-performance, ad-free reader for manga, manhwa, and manhua.
              Synchronized continuously with MangaDex v5 API.
            </p>

            {/* Vercel-style Live Status Indicator */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] text-emerald-400 font-mono">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              All systems operational
            </div>
          </div>

          {/* Links: Discover */}
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3 font-medium">
              Explore
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/browse?type=manga"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  Japanese Manga
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=manhwa"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  Korean Manhwa
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=manhua"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  Chinese Manhua
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?status=ongoing"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  Ongoing Releases
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?status=completed"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  Completed Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Account & Library */}
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3 font-medium">
              Library
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/bookmarks"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  My Bookmarks
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  Reading History
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?order=followedCount"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  Top Rankings
                </Link>
              </li>
              <li>
                <Link
                  href="/auth"
                  className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none rounded-sm"
                >
                  Account Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
          <p>
            Ilovecomix. Manga data provided via MangaDex API.
          </p>
          <p className="text-zinc-600">
            Ad-free &amp; open reading platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
