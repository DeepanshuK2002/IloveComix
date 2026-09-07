"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Home,
  BookOpen,
  MessageSquare,
  List,
  Maximize,
  Minimize,
  Settings,
  HelpCircle,
  ArrowLeftRight,
  Minus,
  Plus,
  X,
  Loader2,
  Send,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Play,
  Pause,
} from "lucide-react";
import { ReaderSettings, type ReaderSettingsValue } from "./ReaderSettings";
import { addHistoryEntry } from "@/lib/user";

interface ReaderProps {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterTitle: string;
  images: string[];
  nextChapterId?: { id: string; title: string } | null;
  prevChapterId?: { id: string; title: string } | null;
  allChapters?: { id: string; title: string }[];
  // Distinct chapter position across all sources (e.g. 12 of 40). When the
  // current chapter has no numeric chapter number these are omitted.
  chapterIndex?: number;
  chapterTotal?: number;
  imageProxyPath?: string;
  // Optional base prefix for chapter links. When provided, chapter links become
  // `${chapterHrefBase}/${chapter.id}` (used by external-source readers). Defaults
  // to the MangaDex reader route `/read/${mangaId}`.
  chapterHrefBase?: string;
}

interface ReaderPageProps {
  url: string;
  index: number;
  chapterId: string;
  isPriority: boolean;
  stripMargin?: number;
  setRef: (el: HTMLDivElement | null) => void;
  onImageLoad?: (index: number) => void;
  imageProxyPath?: string;
}

function ReaderPage({
  url,
  index,
  chapterId,
  isPriority,
  stripMargin = 0,
  setRef,
  onImageLoad,
  imageProxyPath,
}: ReaderPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Reset status if url changes
  useEffect(() => {
    setLoaded(false);
    setHasError(false);
    setRetryKey(0);
  }, [url]);

  const proxySrc = `${imageProxyPath || "/api/proxy/image"}?url=${encodeURIComponent(url)}${
    retryKey > 0 ? `&retry=${retryKey}` : ""
  }`;

  return (
    <div
      id={`page-${index + 1}`}
      ref={setRef}
      className="relative w-full flex flex-col items-center justify-center select-none"
      style={{
        marginBottom: `${stripMargin}px`,
        minHeight: loaded ? undefined : "60vh",
      }}
    >
      {/* Loading Skeleton / Spinner Placeholder */}
      {!loaded && !hasError && (
        <div
          className="w-full flex flex-col items-center justify-center bg-black/40 border border-zinc-900/60 rounded py-20 gap-3"
          style={{ minHeight: "60vh" }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#DF301C]" />
          <span className="text-[11px] font-mono text-zinc-400">
            Loading page {index + 1}...
          </span>
        </div>
      )}

      {/* Error Card with Retry Button */}
      {hasError && (
        <div
          className="w-full flex flex-col items-center justify-center bg-zinc-950/90 border border-red-900/30 rounded py-16 px-4 gap-3 text-center my-2"
          style={{ minHeight: "40vh" }}
        >
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load page {index + 1}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setLoaded(false);
              setRetryKey((k) => k + 1);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-[#DF301C] hover:bg-[#c92a17] text-white text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry Page {index + 1}
          </button>
        </div>
      )}

      {/* Real Image with Native Lazy Loading */}
      {!hasError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${chapterId}-${index}-${retryKey}`}
          src={proxySrc}
          alt={`Page ${index + 1}`}
          loading={isPriority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => {
            setLoaded(true);
            setHasError(false);
            onImageLoad?.(index);
          }}
          onError={() => {
            setHasError(true);
            setLoaded(false);
          }}
          className={`w-full h-auto block select-none shadow-2xl transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
        />
      )}
    </div>
  );
}

const DEFAULT_SETTINGS: ReaderSettingsValue = {
  mode: "webtoon",
  fit: "width",
  direction: "vertical",
  brightness: 100,
  customBg: "#050507",
  customText: "#ffffff",
  useCustomTheme: true,
  tapZones: true,
  showControls: true,
  stripMargin: 0,
  scrollSpeed: "fast",
  scrollStepPercent: 100,
  progressBarPosition: "left",
  preloadMode: "some",
  greyscale: false,
  autoScrollEnabled: false,
  autoScrollSpeed: 3,
};

export function WebtoonReader({
  mangaId,
  mangaTitle,
  chapterId,
  chapterTitle,
  images,
  nextChapterId,
  prevChapterId,
allChapters = [],
  chapterHrefBase,
  chapterIndex,
  chapterTotal,
  imageProxyPath,
}: ReaderProps) {
  const [settings, setSettings] = useState<ReaderSettingsValue>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [zoom, setZoom] = useState(50); // Default 50% matching screenshot
  const [fitWidth, setFitWidth] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "KuroNeko", time: "2h ago", text: "The artwork in this chapter is out of this world! 🔥" },
    { id: 2, user: "SoloReader", time: "5h ago", text: "Page 20 plot twist was insane!" },
    { id: 3, user: "Akira", time: "1d ago", text: "Can't wait for the next update. Thanks for uploading!" },
  ]);

  const scrubberRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const preloadedUrls = useRef<Set<string>>(new Set());

  // Mobile / small screen auto-fade controls state
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer helper
  const clearControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, []);

  // Schedule auto-fadeout
  const scheduleControlsHide = useCallback((delay = 3000) => {
    clearControlsTimer();
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, delay);
  }, [clearControlsTimer]);

  // Show controls and restart timer
  const showControlsTemporarily = useCallback((delay = 3000) => {
    setControlsVisible(true);
    scheduleControlsHide(delay);
  }, [scheduleControlsHide]);

  // Are any modal drawers or overlays open?
  const isAnyOverlayOpen = showSettings || showChapters || showComments || showHelp;

  // Keep controls visible whenever any drawer/modal is open
  useEffect(() => {
    if (isAnyOverlayOpen) {
      setControlsVisible(true);
      clearControlsTimer();
    } else {
      scheduleControlsHide(3000);
    }
  }, [isAnyOverlayOpen, clearControlsTimer, scheduleControlsHide]);

  // Handle touch / scroll on small screens
  useEffect(() => {
    // Initial auto-hide after 3.5s
    scheduleControlsHide(3500);

    const onTouchStart = () => {
      if (isAnyOverlayOpen) return;
      showControlsTemporarily(3200);
    };

    const onScroll = () => {
      if (isAnyOverlayOpen) return;
      // While actively scrolling/reading, fade out sooner
      scheduleControlsHide(1500);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearControlsTimer();
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAnyOverlayOpen, showControlsTemporarily, scheduleControlsHide, clearControlsTimer]);

// Parse chapter number
  const currentChapterNum = chapterTitle.replace(/[^0-9.]/g, "") || "1";
  const currentPosition =
    typeof chapterIndex === "number" && chapterIndex >= 0
      ? chapterIndex + 1
      : null;
  const totalChapters = chapterTotal ?? (allChapters.length || 4);

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem("ilovecomix-reader-settings");
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {}
    }
  }, []);

  const updateSettings = (newSettings: ReaderSettingsValue) => {
    setSettings(newSettings);
    localStorage.setItem("ilovecomix-reader-settings", JSON.stringify(newSettings));
  };

  // Sync isAutoScrolling state with settings.autoScrollEnabled
  useEffect(() => {
    setIsAutoScrolling(Boolean(settings.autoScrollEnabled));
  }, [settings.autoScrollEnabled]);

  const isAutoScrollingRef = useRef(isAutoScrolling);
  isAutoScrollingRef.current = isAutoScrolling;
  const autoScrollSpeedRef = useRef(settings.autoScrollSpeed || 3);
  autoScrollSpeedRef.current = settings.autoScrollSpeed || 3;

  const toggleAutoScroll = useCallback(() => {
    const next = !isAutoScrolling;
    setIsAutoScrolling(next);
    updateSettings({ ...settings, autoScrollEnabled: next });
  }, [isAutoScrolling, settings]);

  // Continuous auto-scroll loop with smooth delta-time scaling
  useEffect(() => {
    if (!isAutoScrolling) return;

    let rafId: number;
    let lastTime: number | null = null;

    const scrollStep = (now: number) => {
      if (!isAutoScrollingRef.current) return;
      if (lastTime === null) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Speed 1 = 35px/s, Speed 3 = 105px/s, Speed 5 = 175px/s, Speed 10 = 350px/s
      const pxPerSec = (autoScrollSpeedRef.current || 3) * 35;
      window.scrollBy({ top: pxPerSec * dt, behavior: "auto" });

      // Stop if reached bottom of page
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;

      if (atBottom) {
        setIsAutoScrolling(false);
        setSettings((s) => {
          const updated = { ...s, autoScrollEnabled: false };
          localStorage.setItem(
            "ilovecomix-reader-settings",
            JSON.stringify(updated)
          );
          return updated;
        });
        return;
      }

      rafId = requestAnimationFrame(scrollStep);
    };

    rafId = requestAnimationFrame(scrollStep);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isAutoScrolling]);

  // Automatically log read chapter to reading history
  useEffect(() => {
    if (mangaId && chapterId) {
      addHistoryEntry({
        comicId: mangaId,
        comicTitle: mangaTitle,
        chapterId: chapterId,
        chapterNumber: currentChapterNum,
        totalChapters: totalChapters,
        coverUrl: images[0] || "",
        completed: currentPage >= images.length && images.length > 0,
        percent: Math.round((currentPage / (images.length || 1)) * 100),
      });
    }
  }, [mangaId, chapterId, mangaTitle, currentChapterNum, totalChapters, images, currentPage]);

  // Reset preloaded URLs and page when chapter changes
  useEffect(() => {
    preloadedUrls.current.clear();
    setCurrentPage(1);
  }, [chapterId, images]);

  // Smart background cache warmer respecting settings.preloadMode
  useEffect(() => {
    if (images.length === 0) return;

    const urlsToPreload: string[] = [];

    if (settings.preloadMode === "all") {
      // Warm all images in background
      for (const url of images) {
        if (url && !preloadedUrls.current.has(url)) {
          urlsToPreload.push(url);
        }
      }
    } else {
      // Warm the next 5 images ahead of the user's active page
      const startIndex = Math.max(0, currentPage - 1);
      const endIndex = Math.min(images.length, startIndex + 5);
      for (let i = startIndex; i < endIndex; i++) {
        const url = images[i];
        if (url && !preloadedUrls.current.has(url)) {
          urlsToPreload.push(url);
        }
      }
    }

    if (urlsToPreload.length === 0) return;

    let cancelled = false;
    let active = 0;
    let queueIdx = 0;
    const maxConcurrent = 3;

    const next = () => {
      if (cancelled) return;
      while (active < maxConcurrent && queueIdx < urlsToPreload.length) {
        const url = urlsToPreload[queueIdx++];
        if (!url || preloadedUrls.current.has(url)) continue;
        preloadedUrls.current.add(url);
        active++;

        const img = new Image();
        img.onload = img.onerror = () => {
          active--;
          if (!cancelled) next();
        };
        img.src = `/api/proxy/image?url=${encodeURIComponent(url)}`;
      }
    };

    next();

    return () => {
      cancelled = true;
    };
  }, [images, chapterId, currentPage, settings.preloadMode]);

  // Fullscreen toggle
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Real-time scroll detection for current page in Webtoon mode
  useEffect(() => {
    if (settings.mode !== "webtoon") return;

    const handleScroll = () => {
      const mid = window.innerHeight / 2;
      for (let i = 0; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= mid && rect.bottom >= mid) {
            setCurrentPage(i + 1);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [settings.mode]);

  // Jump to specific page
  const scrollToPage = useCallback((pageNumber: number) => {
    const targetPage = Math.max(1, Math.min(pageNumber, images.length));
    setCurrentPage(targetPage);

    if (settings.mode === "webtoon") {
      const el = pageRefs.current[targetPage - 1];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [images.length, settings.mode]);

  // Handle vertical scrubber drag / click
  const handleScrubberMove = useCallback((clientY: number) => {
    if (!scrubberRef.current || images.length === 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const ratio = offsetY / rect.height;
    const targetPage = Math.max(1, Math.min(Math.round(ratio * (images.length - 1)) + 1, images.length));
    scrollToPage(targetPage);
  }, [images.length, scrollToPage]);

  const onScrubberMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleScrubberMove(e.clientY);
  };

  useEffect(() => {
    if (!isScrubbing) return;
    const onMouseMove = (e: MouseEvent) => {
      handleScrubberMove(e.clientY);
    };
    const onMouseUp = () => {
      setIsScrubbing(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isScrubbing, handleScrubberMove]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showChapters || showComments || showHelp) return;

      const stepMultiplier = (settings.scrollStepPercent || 100) / 100;
      const scrollBehavior = (settings.scrollSpeed || "fast") === "smooth" ? "smooth" : "auto";

      if (settings.mode === "page") {
        if ((e.key === "ArrowRight" || e.key.toLowerCase() === "d") && settings.direction !== "rtl") {
          scrollToPage(currentPage + 1);
        } else if ((e.key === "ArrowLeft" || e.key.toLowerCase() === "a") && settings.direction === "rtl") {
          scrollToPage(currentPage + 1);
        } else if ((e.key === "ArrowLeft" || e.key.toLowerCase() === "a") && settings.direction !== "rtl") {
          scrollToPage(currentPage - 1);
        } else if ((e.key === "ArrowRight" || e.key.toLowerCase() === "d") && settings.direction === "rtl") {
          scrollToPage(currentPage - 1);
        }
      } else {
        if (e.key === " " && isAutoScrolling) {
          e.preventDefault();
          toggleAutoScroll();
          return;
        }
        if (e.key === "ArrowDown" || e.key === " " || e.key.toLowerCase() === "s") {
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * stepMultiplier, behavior: scrollBehavior });
        } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
          e.preventDefault();
          window.scrollBy({ top: -window.innerHeight * stepMultiplier, behavior: scrollBehavior });
        }
      }

      if (e.key.toLowerCase() === "a" && settings.mode === "webtoon") {
        e.preventDefault();
        toggleAutoScroll();
      }

      if (e.key.toLowerCase() === "f") toggleFullscreen();
      if (e.key.toLowerCase() === "m") {
        updateSettings({ ...settings, mode: settings.mode === "webtoon" ? "page" : "webtoon" });
      }
      if ((e.key === "]" || e.key.toLowerCase() === "n") && nextChapterId) {
        window.location.href = `${chapterHrefBase ?? `/read/${mangaId}`}/${nextChapterId.id}`;
      }
      if ((e.key === "[" || e.key.toLowerCase() === "p") && prevChapterId) {
        window.location.href = `${chapterHrefBase ?? `/read/${mangaId}`}/${prevChapterId.id}`;
      }
      if (e.key === "Escape") {
        if (isAutoScrolling) {
          toggleAutoScroll();
        }
        setShowSettings(false);
        setShowChapters(false);
        setShowComments(false);
        setShowHelp(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settings, currentPage, showSettings, showChapters, showComments, showHelp, scrollToPage, nextChapterId, prevChapterId, chapterHrefBase, mangaId, isAutoScrolling, toggleAutoScroll]);

  // Scrubber percentage calculation
  const totalPages = Math.max(1, images.length);
  const scrubberProgress = ((currentPage - 1) / Math.max(1, totalPages - 1)) * 100;

  return (
    <div
      className="relative min-h-screen select-none overflow-x-hidden"
      style={{
        backgroundColor: settings.useCustomTheme ? settings.customBg : "#050507",
        color: settings.useCustomTheme ? settings.customText : "#ffffff",
      }}
    >
      {/* 1. TOP RIGHT: Floating Chapter Pill Navigator (< Ch.X / Y >) matching screenshot */}
      <div
        onTouchStart={() => showControlsTemporarily(4000)}
        onMouseEnter={clearControlsTimer}
        onMouseLeave={() => scheduleControlsHide(2500)}
        className={`fixed top-3 right-3 sm:top-4 sm:right-4 z-40 flex items-center bg-[#121318]/90 sm:bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-1.5 py-1 shadow-2xl text-xs font-mono select-none transition-all duration-300 ease-in-out ${
          controlsVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto"
        }`}
      >
        {/* Previous Chapter */}
        {prevChapterId ? (
          <Link
            href={`${chapterHrefBase ?? `/read/${mangaId}`}/${prevChapterId.id}`}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title={`Previous Chapter (${prevChapterId.title})`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="p-1.5 text-zinc-600 opacity-40 cursor-not-allowed">
            <ChevronLeft className="h-3.5 w-3.5" />
          </span>
        )}

        {/* Current Chapter / Total Chapter button (opens Chapter List drawer) */}
        <button
          type="button"
          onClick={() => setShowChapters(true)}
          className="px-2 py-1 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
          title="Click to view all chapters"
        >
<span>Ch.{currentPosition ?? currentChapterNum}</span>
          <span className="text-zinc-500 font-normal">/</span>
          <span className="text-zinc-400 font-normal">{totalChapters}</span>
        </button>

        {/* Next Chapter */}
        {nextChapterId ? (
          <Link
            href={`${chapterHrefBase ?? `/read/${mangaId}`}/${nextChapterId.id}`}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title={`Next Chapter (${nextChapterId.title})`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="p-1.5 text-zinc-600 opacity-40 cursor-not-allowed">
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* 2. RIGHT DOCK: Floating Vertical Action Toolbar (matching screenshot) */}
      <div
        onTouchStart={() => showControlsTemporarily(4000)}
        onMouseEnter={clearControlsTimer}
        onMouseLeave={() => scheduleControlsHide(2500)}
        className={`fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-[#121318]/90 sm:bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300 ease-in-out ${
          controlsVisible
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-4 pointer-events-none sm:opacity-100 sm:translate-x-0 sm:pointer-events-auto"
        }`}
      >
        {/* Home */}
        <Link
          href={`/`}
          className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all group relative"
          title="Go to Home Page"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:block absolute right-full mr-2 px-2 py-1 bg-black/90 text-[10px] font-mono text-white rounded border border-white/10 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Home
          </span>
        </Link>

        {/* Comics Profile */}
        <Link
          href={`/manga/${mangaId}`}
          className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all group relative"
          title="Go to Comics Profile"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:block absolute right-full mr-2 px-2 py-1 bg-black/90 text-[10px] font-mono text-white rounded border border-white/10 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Comics Profile
          </span>
        </Link>

        {/* Comments */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={`p-2 sm:p-2.5 rounded-xl transition-all group relative ${
            showComments
              ? "text-[#DF301C] bg-[#DF301C]/10"
              : "text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
          title="Comments"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:block absolute right-full mr-2 px-2 py-1 bg-black/90 text-[10px] font-mono text-white rounded border border-white/10 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Comments
          </span>
        </button>

        {/* Chapter List */}
        <button
          type="button"
          onClick={() => setShowChapters(true)}
          className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all group relative"
          title="Chapters"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:block absolute right-full mr-2 px-2 py-1 bg-black/90 text-[10px] font-mono text-white rounded border border-white/10 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chapter List
          </span>
        </button>

        {/* Fullscreen (desktop only) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all group relative"
          title="Toggle Fullscreen (F)"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="hidden sm:block absolute right-full mr-2 px-2 py-1 bg-black/90 text-[10px] font-mono text-white rounded border border-white/10 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Fullscreen
          </span>
        </button>

        {/* Auto Scroll Toggle Button */}
        <button
          type="button"
          onClick={toggleAutoScroll}
          className={`p-2 sm:p-2.5 rounded-xl transition-all group relative ${
            isAutoScrolling
              ? "text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20"
              : "text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
          title={isAutoScrolling ? "Pause Auto Scroll (Space or A)" : "Start Auto Scroll (A)"}
        >
          {isAutoScrolling ? (
            <Pause className="h-4 w-4 fill-emerald-400" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className="hidden sm:block absolute right-full mr-2 px-2 py-1 bg-black/90 text-[10px] font-mono text-white rounded border border-white/10 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isAutoScrolling
              ? `Auto Scroll: Level ${settings.autoScrollSpeed || 3} (Active)`
              : "Auto Scroll (A)"}
          </span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all group relative"
          title="Reader Settings"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:block absolute right-full mr-2 px-2 py-1 bg-black/90 text-[10px] font-mono text-white rounded border border-white/10 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Settings
          </span>
        </button>

        {/* Help & Shortcuts */}
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all group relative"
          title="Shortcuts & Help"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:block absolute right-full mr-2 px-2 py-1 bg-black/90 text-[10px] font-mono text-white rounded border border-white/10 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Shortcuts
          </span>
        </button>
      </div>

      {/* 3. PROGRESS BAR: Dynamic placement based on settings.progressBarPosition */}
      {settings.progressBarPosition === "top" && (
        <div className="fixed top-0 left-0 right-0 h-1 z-40 bg-zinc-900/80 pointer-events-none">
          <div
            className="h-full bg-[#818cf8] transition-all duration-150"
            style={{ width: `${scrubberProgress}%` }}
          />
        </div>
      )}

      {settings.progressBarPosition === "bottom" && (
        <div className="fixed bottom-0 left-0 right-0 h-1 z-40 bg-zinc-900/80 pointer-events-none">
          <div
            className="h-full bg-[#818cf8] transition-all duration-150"
            style={{ width: `${scrubberProgress}%` }}
          />
        </div>
      )}

      {(settings.progressBarPosition === "left" ||
        settings.progressBarPosition === "right" ||
        !settings.progressBarPosition) && (
          <div
            onTouchStart={() => showControlsTemporarily(4000)}
            className={`fixed top-0 bottom-0 z-30 flex items-center select-none transition-all duration-300 ease-in-out ${
              controlsVisible
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto"
            } ${
              settings.progressBarPosition === "right"
                ? "right-12 sm:right-16 justify-end pr-1 sm:pr-2 w-8 sm:w-16"
                : "left-0 justify-start pl-1 sm:pl-2 w-8 sm:w-16"
            }`}
          >
            <div
              ref={scrubberRef}
              onMouseDown={onScrubberMouseDown}
              className="relative h-[85vh] w-5 cursor-pointer flex flex-col justify-between py-2 group"
              title="Drag to scrub pages"
            >
              {/* Subtle vertical tick marks */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                {Array.from({ length: Math.min(totalPages, 36) }).map((_, i) => (
                  <div key={i} className="w-4 h-[1px] bg-zinc-600" />
                ))}
              </div>

              {/* Active indicator thumb (Purple badge '20' + 'Page 20' box matching screenshot) */}
              <div
                className="absolute left-0 transition-transform duration-100 ease-out flex flex-col items-start pointer-events-none"
                style={{
                  top: `${Math.min(95, Math.max(0, scrubberProgress))}%`,
                  transform: "translateY(-50%)",
                }}
              >
                {/* Active Purple Indicator Pill with page number */}
                <div className="bg-[#818cf8] text-black font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shadow-lg flex items-center justify-center">
                  {currentPage}
                </div>

                {/* Sub-box: 'Page 20' - hide on small screens to prevent overlap */}
                <div className="hidden sm:block mt-1 bg-black/90 border border-zinc-700/80 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-200 shadow-xl whitespace-nowrap">
                  Page {currentPage}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* 4. BOTTOM RIGHT: Zoom / Fit Controls (hidden on small screens matching screenshot) */}
      <div className="hidden sm:flex fixed bottom-4 right-4 z-40 items-center bg-[#121318]/90 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 shadow-2xl text-xs font-mono text-zinc-300 gap-1.5">
        {/* Toggle Width Fit */}
        <button
          type="button"
          onClick={() => setFitWidth(!fitWidth)}
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
            fitWidth ? "text-[#DF301C]" : "text-zinc-400 hover:text-white"
          }`}
          title={fitWidth ? "Reset Zoom" : "Fit Width"}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(30, z - 10))}
          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        {/* Zoom Percentage */}
        <button
          type="button"
          onClick={() => {
            setZoom(50);
            setFitWidth(false);
          }}
          className="px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
          title="Reset to 50%"
        >
          {fitWidth ? "FIT" : `${zoom}%`}
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(120, z + 10))}
          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 5. FLOATING AUTO SCROLL SPEED CONTROLLER PILL */}
      {isAutoScrolling && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#121318]/95 backdrop-blur-md border border-emerald-500/40 rounded-full px-3.5 py-1.5 shadow-2xl text-xs font-mono text-white select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            onClick={toggleAutoScroll}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 pr-2 border-r border-white/10 cursor-pointer"
            title="Pause Auto Scroll (Space or A)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Pause className="h-3 w-3 fill-emerald-400" />
            <span className="font-bold text-[11px]">Auto Scroll</span>
          </button>

          {/* Speed multiplier display */}
          <span className="text-[11px] font-bold text-zinc-200 px-1">
            {settings.autoScrollSpeed || 3}x
          </span>

          {/* Slower (-) */}
          <button
            type="button"
            onClick={() =>
              updateSettings({
                ...settings,
                autoScrollSpeed: Math.max(1, (settings.autoScrollSpeed || 3) - 1),
              })
            }
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Slower speed"
          >
            <Minus className="h-3 w-3" />
          </button>

          {/* Faster (+) */}
          <button
            type="button"
            onClick={() =>
              updateSettings({
                ...settings,
                autoScrollSpeed: Math.min(10, (settings.autoScrollSpeed || 3) + 1),
              })
            }
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Faster speed"
          >
            <Plus className="h-3 w-3" />
          </button>

          {/* Stop button (X) */}
          <button
            type="button"
            onClick={() => {
              setIsAutoScrolling(false);
              updateSettings({ ...settings, autoScrollEnabled: false });
            }}
            className="ml-1 p-1 rounded-full bg-white/10 text-zinc-300 hover:text-white hover:bg-red-500/30 transition-colors cursor-pointer"
            title="Stop Auto Scroll"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* 6. MAIN CANVAS: Webtoon Continuous or Single Page Reader */}
      <main
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button, a, input, select, textarea")) return;
          if (window.innerWidth < 640) {
            if (controlsVisible) {
              clearControlsTimer();
              setControlsVisible(false);
            } else {
              showControlsTemporarily(3500);
            }
          }
        }}
        className="flex flex-col items-center justify-center min-h-screen py-0 sm:py-6 px-0 sm:px-4"
        style={{
          filter: `brightness(${settings.brightness}%)${settings.greyscale ? " grayscale(100%)" : ""}`,
        }}
      >
        {settings.mode === "webtoon" ? (
          /* Webtoon Continuous Vertical Scroll */
          <div
            className="flex flex-col items-center transition-all duration-300 w-full"
            style={{
              width: "100%",
              maxWidth: fitWidth ? "1100px" : `${zoom * 18}px`,
            }}
          >
            {images.map((url, index) => (
              <ReaderPage
                key={`${chapterId}-${index}`}
                url={url}
                index={index}
                chapterId={chapterId}
                isPriority={index < 3}
                imageProxyPath={imageProxyPath}
                stripMargin={settings.stripMargin || 0}
                setRef={(el) => {
                  pageRefs.current[index] = el;
                }}
              />
            ))}

            {/* End of Chapter Navigation Card */}
            <div className="w-full max-w-xl mx-auto mt-10 mb-16 p-6 rounded-2xl bg-[#121318]/90 border border-zinc-800 text-center shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 mb-2 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>End of {chapterTitle}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-6">
                {nextChapterId ? "Ready for the next chapter?" : "You're all caught up!"}
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {prevChapterId && (
                  <Link
                    href={`${chapterHrefBase ?? `/read/${mangaId}`}/${prevChapterId.id}`}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 border border-zinc-700/80"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Prev: {prevChapterId.title}</span>
                  </Link>
                )}

                {nextChapterId ? (
                  <Link
                    href={`${chapterHrefBase ?? `/read/${mangaId}`}/${nextChapterId.id}`}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#DF301C] hover:bg-[#c92a17] text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#DF301C]/20"
                  >
                    <span>Next: {nextChapterId.title}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href={`/manga/${mangaId}`}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Back to Manga Info</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Single Page Reader Mode */
          <div
            className="flex flex-col items-center justify-center min-h-[90vh] transition-all duration-300"
            style={{
              width: fitWidth ? "100%" : `${Math.min(100, zoom * 1.8)}%`,
              maxWidth: fitWidth ? "1100px" : `${zoom * 18}px`,
            }}
          >
            {images.length > 0 && currentPage <= images.length && (
              <div className="w-full flex flex-col items-center">
                <ReaderPage
                  key={`${chapterId}-page-${currentPage}`}
                  url={images[currentPage - 1]}
                  index={currentPage - 1}
                  chapterId={chapterId}
                  isPriority={true}
                  imageProxyPath={imageProxyPath}
                  setRef={(el) => {
                    pageRefs.current[currentPage - 1] = el;
                  }}
                />

                {/* Page Navigation & Next Chapter prompt on final page */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => scrollToPage(currentPage - 1)}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-mono font-medium text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev Page
                  </button>
                  <span className="text-xs font-mono text-zinc-400">
                    {currentPage} / {images.length}
                  </span>
                  {currentPage < images.length ? (
                    <button
                      type="button"
                      onClick={() => scrollToPage(currentPage + 1)}
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs font-mono font-medium text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Next Page
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : nextChapterId ? (
                    <Link
                      href={`${chapterHrefBase ?? `/read/${mangaId}`}/${nextChapterId.id}`}
                      className="px-4 py-1.5 rounded-lg bg-[#DF301C] hover:bg-[#c92a17] text-xs font-mono font-bold text-white transition-colors flex items-center gap-1 shadow"
                    >
                      Next Chapter
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 6. DRAWER: Comments Panel */}
      {showComments && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 bg-[#0f1015]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#DF301C]" />
              <h3 className="text-sm font-bold text-zinc-100">Chapter Comments</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowComments(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {comments.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span className="font-bold text-zinc-200">{c.user}</span>
                  <span>{c.time}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <div className="p-3 border-t border-zinc-800 flex items-center gap-2 bg-[#14151c]">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              autoComplete="off"
              data-1p-ignore="true"
              data-lpignore="true"
              suppressHydrationWarning
              onKeyDown={(e) => {
                if (e.key === "Enter" && commentInput.trim()) {
                  setComments([
                    { id: Date.now(), user: "You", time: "Just now", text: commentInput.trim() },
                    ...comments,
                  ]);
                  setCommentInput("");
                }
              }}
              placeholder="Leave a thought..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#DF301C]"
            />
            <button
              type="button"
              onClick={() => {
                if (commentInput.trim()) {
                  setComments([
                    { id: Date.now(), user: "You", time: "Just now", text: commentInput.trim() },
                    ...comments,
                  ]);
                  setCommentInput("");
                }
              }}
              className="p-2 rounded-lg bg-[#DF301C] text-white hover:bg-[#c92a17] transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 7. DRAWER: Chapter List */}
      {showChapters && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 bg-[#0f1015]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-[#DF301C]" />
              <h3 className="text-sm font-bold text-zinc-100">Chapter List</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowChapters(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {allChapters.map((ch) => {
              const isActive = ch.id === chapterId;
              return (
                <Link
                  key={ch.id}
                  href={`${chapterHrefBase ?? `/read/${mangaId}`}/${ch.id}`}
                  onClick={() => setShowChapters(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all ${
                    isActive
                      ? "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/30 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <span className="truncate">{ch.title}</span>
                  {isActive && <span className="text-[10px] uppercase font-bold shrink-0">Reading</span>}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. MODAL: Reader Settings */}
      {showSettings && (
        <ReaderSettings
          settings={settings}
          onChange={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 9. MODAL: Shortcuts & Help */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#121318] p-5 shadow-2xl text-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#DF301C]" />
                <h4 className="text-sm font-bold text-white">Keyboard Shortcuts</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Next / Prev Page</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">← / →</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Next / Prev Chapter</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">] / [ (or N / P)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Scroll Up / Down</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">↑ / ↓</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Toggle Fullscreen</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">F</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Webtoon / Page Mode</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">M</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Auto Scroll Toggle</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">A / Space</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Close Overlay</span>
                <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">Esc</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
