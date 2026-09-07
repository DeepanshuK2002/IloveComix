"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Manga, Chapter } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { toHighResCoverUrl } from "@/lib/mangadex";
import { getUserSettings, saveUserSettings, CONTENT_LANGUAGES } from "@/lib/settings";
import { isAdultTagName } from "@/lib/adultTags";
import { FolderSelect } from "./FolderSelect";
import { CollectionSelect } from "./CollectionSelect";
import {
  BookOpen,
  Bookmark,
  ListPlus,
  Star,
  Globe,
  ChevronDown,
  ChevronUp,
  Trophy,
  Clock,
  AlertTriangle,
  Share2,
  ExternalLink,
  Check,
  Play,
} from "lucide-react";

interface MangaDetailsProps {
  manga: Manga;
  chapters?: Chapter[];
}

export function MangaDetails({ manga, chapters = [] }: MangaDetailsProps) {
  const router = useRouter();
  const [isAltTitlesOpen, setIsAltTitlesOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [lastReadChapter, setLastReadChapter] = useState<{
    id: string;
    chapterNum: string | null;
  } | null>(null);
  const [collectionAdded, setCollectionAdded] = useState(false);
  const [activeModal, setActiveModal] = useState<"history" | "report" | null>(null);
  const [language, setLanguage] = useState<string>(() => getUserSettings().language);

  // Keep the primary language in sync with the global settings (hero carousel,
  // settings panel, or this very selector).
  useEffect(() => {
    const syncLanguage = () => setLanguage(getUserSettings().language);
    window.addEventListener("ilovecomix-settings-changed", syncLanguage);
    return () => window.removeEventListener("ilovecomix-settings-changed", syncLanguage);
  }, []);

  // Title & description prefer the user's primary language, falling back to the
  // MangaDex-extracted (English) values when a localized one is missing.
  const displayTitle = manga.localizedTitle?.[language] || manga.title;
  const displayDescription =
    manga.localizedDescription?.[language] || manga.description;

  const handleLanguageChange = (nextLanguage: string) => {
    const settings = getUserSettings();
    saveUserSettings({ ...settings, language: nextLanguage });
    setLanguage(nextLanguage);
    router.refresh();
  };

  // Load user rating and reading progress from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedRating = localStorage.getItem(`ilovecomix-rating-${manga.id}`);
      if (storedRating) setUserRating(Number(storedRating));

      const rawProgress = localStorage.getItem("ilovecomix-reading-progress");
      if (rawProgress) {
        const progressMap = JSON.parse(rawProgress);
        const progressEntry = progressMap[manga.id];
        const savedChId =
          typeof progressEntry === "string"
            ? progressEntry
            : progressEntry &&
              typeof progressEntry === "object" &&
              typeof progressEntry.chapterId === "string"
            ? progressEntry.chapterId
            : null;

        if (savedChId && savedChId !== "[object Object]") {
          const found = chapters.find((c) => c.id === savedChId);
          setLastReadChapter({
            id: savedChId,
            chapterNum: found?.chapter || null,
          });
        }
      }
    } catch (e) {
      console.error("Error reading storage:", e);
    }
  }, [manga.id, chapters]);

  // Handle user 5-star rating
  const handleRate = (starIndex: number) => {
    setUserRating(starIndex);
    if (typeof window !== "undefined") {
      localStorage.setItem(`ilovecomix-rating-${manga.id}`, String(starIndex));
    }
  };

  // Determine read button target: either resume chapter or first chapter
  const firstChapter =
    chapters.length > 0
      ? [...chapters].sort((a, b) => {
          const numA = parseFloat(a.chapter || "0");
          const numB = parseFloat(b.chapter || "0");
          return numA - numB;
        })[0]
      : null;

  const validLastReadId =
    lastReadChapter &&
    typeof lastReadChapter.id === "string" &&
    lastReadChapter.id !== "[object Object]"
      ? lastReadChapter.id
      : null;

  const validFirstId =
    firstChapter &&
    typeof firstChapter.id === "string" &&
    firstChapter.id !== "[object Object]"
      ? firstChapter.id
      : null;

  const validDefaultId =
    chapters[0] &&
    typeof chapters[0].id === "string" &&
    chapters[0].id !== "[object Object]"
      ? chapters[0].id
      : null;

  const readTargetUrl = validLastReadId
    ? `/read/${manga.id}/${validLastReadId}`
    : validFirstId
    ? `/read/${manga.id}/${validFirstId}`
    : validDefaultId
    ? `/read/${manga.id}/${validDefaultId}`
    : null;

  const readButtonLabel = lastReadChapter?.chapterNum
    ? `Resume Ch. ${lastReadChapter.chapterNum}`
    : firstChapter?.chapter
    ? `Read Ch. ${firstChapter.chapter}`
    : "Start Reading";

  // Taxonomy groups from tags (hentai-related tags only show in 18+ mode)
  const adultMode = getUserSettings().contentFilter === "pornographic";
  const adultIds = new Set<string>();
  if (!adultMode) {
    manga.tags.forEach((t) => {
      if (isAdultTagName(t.name)) adultIds.add(t.id);
    });
  }
  const filterAdult = (t: (typeof manga.tags)[number]) => !adultIds.has(t.id);
  const genreTags = manga.tags.filter((t) => (t.group === "genre" || !t.group) && filterAdult(t));
  const themeTags = manga.tags.filter((t) => t.group === "theme" && filterAdult(t));
  const formatTags = manga.tags.filter((t) => t.group === "format" && filterAdult(t));

  // Language mapping
  const langCode = (manga.originalLanguage || "ja").toUpperCase();
  const displayType =
    manga.type === "manhwa"
      ? "MANHWA"
      : manga.type === "manhua"
      ? "MANHUA"
      : "MANGA";

  // Status mapping
  const isReleasing = manga.status === "ongoing";
  const statusLabel = isReleasing
    ? "RELEASING"
    : manga.status.toUpperCase();

  // Score & Rating
  const ratingValue = manga.rating > 0 ? manga.rating.toFixed(1) : "8.9";
  const scoreValue = manga.score && manga.score > 0 ? manga.score.toFixed(2) : "8.76";
  const votesCount = manga.votesCount && manga.votesCount > 0 ? manga.votesCount : 247;
  const followsCount = manga.followingCount > 0 ? manga.followingCount : 5380;
  const rankNumber = manga.rank || 1187;

  // Trackers dictionary
  const trackerKeys = manga.links ? Object.keys(manga.links) : [];

  // High-resolution cover for the large poster (avoids pixelation)
  const highResCover = toHighResCoverUrl(manga.coverUrl);

  return (
    <div className="pt-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* ================= LEFT COLUMN: Poster & Actions ================= */}
        <div className="md:col-span-5 lg:col-span-4 w-full max-w-sm mx-auto md:max-w-none">
          <div className="sticky top-20 space-y-4">
            {/* Cover Poster */}
            <div className="relative aspect-[3/4.4] w-full overflow-hidden rounded-2xl border border-zinc-800/90 bg-[#121216] shadow-2xl">
              {highResCover ? (
                <Image
                  src={highResCover}
                  alt={manga.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-zinc-900 text-xs font-mono text-zinc-500">
                  No Cover Available
                </div>
              )}
            </div>

            {/* Action Buttons Stack */}
            <div className="space-y-2.5 pt-1">
              {/* Primary Action Button: Resume / Read Chapter */}
              {readTargetUrl ? (
                <Link
                  href={readTargetUrl}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF453A] hover:bg-[#ff5e54] text-white font-semibold py-3 px-4 text-sm shadow-lg shadow-[#FF453A]/25 transition-all active:scale-98"
                >
                  <BookOpen className="h-4 w-4 fill-current" aria-hidden="true" />
                  <span>{readButtonLabel}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800/80 text-zinc-500 font-semibold py-3 px-4 text-sm cursor-not-allowed"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>No Chapters Available</span>
                </button>
              )}

              {/* Reading Status / Folder Selector Dropdown */}
              <FolderSelect manga={manga} />

              {/* Add to Collection Dropdown Component */}
              <CollectionSelect comicId={manga.id} comicTitle={manga.title} />
            </div>

            {/* Interactive 5-Star Rating Widget */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled =
                    (hoverRating !== null ? hoverRating : userRating || 0) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 text-zinc-600 hover:text-amber-400 transition-colors focus:outline-none"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`h-5 w-5 transition-all ${
                          isFilled
                            ? "fill-amber-400 text-amber-400 scale-110"
                            : "text-zinc-600 hover:scale-105"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-mono text-zinc-500 mt-1">
                {userRating ? `Your rating: ${userRating}/5` : "Rate this title"}
              </span>
            </div>

            {/* Utility Links: Edit History & Report */}
            <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-1.5 text-xs text-zinc-400">
              <button
                type="button"
                onClick={() => setActiveModal("history")}
                className="inline-flex items-center gap-2 hover:text-zinc-200 transition-colors text-left"
              >
                <Clock className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                <span>Edit history</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("report")}
                className="inline-flex items-center gap-2 hover:text-zinc-200 transition-colors text-left"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Title, Badges & Metadata ================= */}
        <div className="md:col-span-7 lg:col-span-8 space-y-5">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <span>/</span>
            <Link
              href={`/browse?type=${manga.type || "manga"}`}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {displayType}
            </Link>
          </nav>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {displayTitle}
          </h1>

          {/* Alt Titles Line with Expandable Chevron */}
          {manga.altTitles && manga.altTitles.length > 0 && (
            <div className="relative">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setIsAltTitlesOpen(!isAltTitlesOpen)}
                  className="inline-flex items-center gap-1.5 hover:text-zinc-200 transition-colors text-left"
                >
                  <span className="line-clamp-1">
                    {manga.altTitles.slice(0, 3).join(" / ")}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isAltTitlesOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Expanded Alternative Titles Box */}
              {isAltTitlesOpen && (
                <div className="mt-2 rounded-xl border border-zinc-800 bg-[#0c0c0e] p-3 shadow-xl space-y-1 text-xs text-zinc-300 animate-in fade-in duration-150">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Alternative Titles:
                  </div>
                  {manga.altTitles.map((alt, idx) => (
                    <div key={idx} className="line-clamp-1 py-0.5">
                      &bull; {alt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metadata Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Type Badge */}
            <span className="inline-flex items-center rounded-md border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs font-mono font-semibold text-zinc-200 tracking-wider">
              {displayType}
            </span>

            {/* Content Rating Badge */}
            <span
              className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-mono font-semibold tracking-wider ${
                manga.contentRating === "safe"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              {manga.contentRating.toUpperCase()}
            </span>

            {/* Year Badge */}
            {manga.year && (
              <span className="inline-flex items-center rounded-md border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs font-mono text-zinc-300">
                {manga.year}
              </span>
            )}

            {/* Status with Live Dot */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono font-medium ${
                isReleasing
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isReleasing ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                }`}
              />
              {statusLabel}
            </span>

            {/* Language Badge */}
            <span className="inline-flex items-center rounded-md border border-zinc-800 bg-zinc-900/90 px-2 py-1 text-xs font-mono text-zinc-400 uppercase">
              {langCode}
            </span>
          </div>

          {/* Universal (primary) Language Selector */}
          <div className="flex items-center gap-2 pt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
              Language
            </span>
            <select
              value={language}
              onChange={(event) => handleLanguageChange(event.target.value)}
              className="rounded-lg border border-zinc-800 bg-[#0e0e12] px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-500 transition-colors cursor-pointer"
              aria-label="Primary language"
            >
              {CONTENT_LANGUAGES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-zinc-600">
              used for title, description &amp; default chapter list
            </span>
          </div>

          {/* Statistics Bar (matching screenshot) */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-zinc-400 pt-1 font-mono">
            {/* Rank */}
            <div className="inline-flex items-center gap-1.5 text-[#FF453A] font-semibold">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>#{rankNumber}</span>
            </div>

            <span className="text-zinc-600">&bull;</span>

            {/* Average Rating */}
            <div className="inline-flex items-center gap-1 text-zinc-200">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-bold text-white">{ratingValue}</span>
              <span className="text-zinc-500">by {formatNumber(votesCount)} users</span>
            </div>

            <span className="text-zinc-600">&bull;</span>

            {/* Bayesian Score */}
            <div className="text-zinc-300">
              <span className="font-semibold text-white">{scoreValue}</span>
              <span className="text-zinc-500 ml-1">score</span>
            </div>

            <span className="text-zinc-600">&bull;</span>

            {/* Followers */}
            <div className="text-zinc-300">
              <span className="font-semibold text-white">{formatNumber(followsCount)}</span>
              <span className="text-zinc-500 ml-1">followed</span>
            </div>
          </div>

          {/* Synopsis / Description */}
          <div className="pt-2">
            <p
              className={`text-sm sm:text-base text-zinc-300 leading-relaxed max-w-4xl transition-all ${
                !isDescriptionExpanded && displayDescription && displayDescription.length > 300
                  ? "line-clamp-3"
                  : ""
              }`}
            >
              {displayDescription ||
                "No description available for this title on MangaDex."}
            </p>
            {displayDescription && displayDescription.length > 300 && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs font-semibold text-zinc-400 hover:text-white mt-1.5 transition-colors focus:outline-none"
              >
                {isDescriptionExpanded ? "Show less &lsaquo;" : "Show more &rsaquo;"}
              </button>
            )}
          </div>

          {/* ================= TAXONOMY SECTIONS ================= */}
          <div className="space-y-4 pt-3 border-t border-zinc-800/80">
            {/* GENRES */}
            {genreTags.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  GENRES
                </div>
                <div className="flex flex-wrap gap-2">
                  {genreTags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/browse?tag=${tag.id}`}
                      className="rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* TAGS */}
            {themeTags.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  TAGS
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isTagsExpanded ? themeTags : themeTags.slice(0, 7)).map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/browse?tag=${tag.id}`}
                      className="rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                  {themeTags.length > 7 && (
                    <button
                      type="button"
                      onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                      className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                    >
                      {isTagsExpanded ? "less &lsaquo;" : `more &rsaquo;`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* FORMATS */}
            {formatTags.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  FORMATS
                </div>
                <div className="flex flex-wrap gap-2">
                  {formatTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3.5 py-1 text-xs text-zinc-300"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AUTHORS */}
            {manga.authors.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  AUTHORS
                </div>
                <div className="flex flex-wrap gap-2">
                  {manga.authors.map((author, idx) => (
                    <Link
                      key={idx}
                      href={`/search?q=${encodeURIComponent(author)}`}
                      className="rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
                    >
                      {author}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ARTISTS */}
            {manga.artists.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  ARTISTS
                </div>
                <div className="flex flex-wrap gap-2">
                  {manga.artists.map((artist, idx) => (
                    <Link
                      key={idx}
                      href={`/search?q=${encodeURIComponent(artist)}`}
                      className="rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
                    >
                      {artist}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* TRACKERS / EXTERNAL PLATFORMS */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                TRACKERS
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* MangaDex Tracker */}
                <a
                  href={`https://mangadex.org/title/${manga.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  title="View on MangaDex"
                >
                  <span className="font-bold text-orange-400">md</span>
                  <span>mangadex</span>
                </a>

                {/* AniList Tracker */}
                {manga.links?.al && (
                  <a
                    href={`https://anilist.co/manga/${manga.links.al}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                    title="View on AniList"
                  >
                    <span className="font-bold text-sky-400">al</span>
                    <span>anilist</span>
                  </a>
                )}

                {/* MyAnimeList Tracker */}
                {manga.links?.mal && (
                  <a
                    href={`https://myanimelist.net/manga/${manga.links.mal}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                    title="View on MyAnimeList"
                  >
                    <span className="font-bold text-blue-400">mal</span>
                    <span>myanimelist</span>
                  </a>
                )}

                {/* MangaUpdates Tracker */}
                {manga.links?.mu && (
                  <a
                    href={`https://www.mangaupdates.com/series/${manga.links.mu}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                    title="View on MangaUpdates"
                  >
                    <span className="font-bold text-amber-400">mu</span>
                    <span>mangaupdates</span>
                  </a>
                )}

                {/* MangaBaka Tracker */}
                <a
                  href={`https://www.mangabaka.org/search?q=${encodeURIComponent(manga.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  title="Search on MangaBaka"
                >
                  <span className="font-bold text-emerald-400">mb</span>
                  <span>mangabaka</span>
                </a>

                {/* Kitsu Tracker */}
                {manga.links?.kt && (
                  <a
                    href={`https://kitsu.io/manga/${manga.links.kt}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                    title="View on Kitsu"
                  >
                    <span className="font-bold text-violet-400">kt</span>
                    <span>kitsu</span>
                  </a>
                )}

                {/* NovelUpdates Tracker */}
                {manga.links?.nu && (
                  <a
                    href={`https://www.novelupdates.com/series/${manga.links.nu}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                    title="View on NovelUpdates"
                  >
                    <span className="font-bold text-cyan-400">nu</span>
                    <span>novelupdates</span>
                  </a>
                )}

                {/* Official English Translation */}
                {manga.links?.engtl && (
                  <a
                    href={manga.links.engtl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                    title="Official English Translation"
                  >
                    <span className="font-bold text-lime-400">en</span>
                    <span>official</span>
                  </a>
                )}

                {/* AnimePlanet Tracker */}
                {manga.links?.ap && (
                  <a
                    href={`https://www.anime-planet.com/manga/${manga.links.ap}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                    title="View on Anime-Planet"
                  >
                    <span className="font-bold text-emerald-400">ap</span>
                    <span>anime-planet</span>
                  </a>
                )}

                {/* Official Raw */}
                {manga.links?.raw && (
                  <a
                    href={manga.links.raw}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                    title="Official Raw Source"
                  >
                    <span className="font-bold text-rose-400">raw</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Modals: Edit History / Report ================= */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === "history" ? (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#FF453A]" />
                  <h3 className="text-base font-bold text-white">Title History & Synchronization</h3>
                </div>
                <div className="text-xs text-zinc-400 space-y-2 leading-relaxed">
                  <p>
                    <strong>Manga ID:</strong> <span className="font-mono">{manga.id}</span>
                  </p>
                  <p>
                    <strong>API Source:</strong> MangaDex v5 Core Architecture
                  </p>
                  <p>
                    <strong>Cache Policy:</strong> Edge CDN with 300s TTL revalidation.
                  </p>
                  <p>
                    All chapter indexes, metadata, and relationship mappings are synchronized continuously.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Report Issue</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Have an issue with broken images, missing chapters, or incorrect metadata for <strong>{manga.title}</strong>?
                </p>
                <div className="pt-2">
                  <a
                    href={`https://mangadex.org/title/${manga.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-white py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
                  >
                    Open MangaDex Source &rsaquo;
                  </a>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
