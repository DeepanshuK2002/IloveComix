"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HomeFeedRail } from "@/components/home/HomeFeedRail";
import { getUserSettings } from "@/lib/settings";

interface AdultSource {
  siteName: string;
}

interface AdultItem {
  id: string;
  title: string;
  cover?: string | null;
  url: string;
  sources: AdultSource[];
  popularity: number;
  isNew: boolean;
}

interface AdultFeedData {
  allowed?: boolean;
  items: AdultItem[];
}

const COVER_PROXY =
  process.env.NEXT_PUBLIC_ADULT_IMAGE_PROXY || "/api/adult/image?url=";

export function AdultFeed({ serverEnabled = false }: { serverEnabled?: boolean }) {
  const [enabled, setEnabled] = useState(serverEnabled);
  const [data, setData] = useState<AdultFeedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (refresh: boolean) => {
    setLoading(true);
    if (refresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/adult/popular${refresh ? "?refresh=1" : ""}`, {
        cache: "no-store",
      });
      if (res.status === 403) {
        setEnabled(false);
        setData(null);
        return;
      }
      const json: AdultFeedData = await res.json();
      if (!json.allowed) {
        setEnabled(false);
        setData(null);
        return;
      }
      setData(json);
      setError(null);
    } catch {
      setError("Adult feed is currently unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setEnabled(serverEnabled || getUserSettings().contentFilter === "pornographic");
    const onSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ contentFilter?: string }>;
      const filter = customEvent.detail?.contentFilter || getUserSettings().contentFilter;
      const next = filter === "pornographic";
      setEnabled(next);
      setError(null);
      if (next) load(false);
    };
    window.addEventListener("ilovecomix-settings-changed", onSettingsChange);
    return () => window.removeEventListener("ilovecomix-settings-changed", onSettingsChange);
  }, [load]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    load(false);
    timerRef.current = setInterval(() => load(true), 10 * 60 * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, load]);

  if (!enabled) return null;

  const items = data?.items.map((item) => ({
    id: item.id,
    title: item.title,
    coverUrl: item.cover ? `${COVER_PROXY}${encodeURIComponent(item.cover)}` : null,
    href: `/adult/read?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`,
    chapter: item.popularity > 1 ? `x${item.popularity} sites` : "Trending",
    timeAgo: item.sources[0]?.siteName || "18+",
    badgeLabel: item.isNew ? "NEW" : "18+",
  })) || [];

  return (
    <HomeFeedRail
      title="Trending Everywhere"
      items={items}
      emptyMessage={error || "No trending titles right now."}
      loading={loading || refreshing}
      onRefresh={() => load(true)}
      hideBrowseRefresh
      headerActions={
        <span className="rounded-full bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/30 px-2 py-0.5 text-[10px] font-mono font-bold">
          18+
        </span>
      }
    />
  );
}
