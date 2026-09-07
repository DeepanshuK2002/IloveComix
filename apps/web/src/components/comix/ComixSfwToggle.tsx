"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield, ShieldOff } from "lucide-react";

const STORAGE_KEY = "ilovecomix-comix-sfw";
const COOKIE_KEY = "ilovecomix-comix-sfw";

function readStoredSfw(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === null ? true : value !== "false";
  } catch {
    return true;
  }
}

function writeStoredSfw(sfw: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, sfw ? "true" : "false");
  } catch {
    /* storage unavailable - ignore */
  }
  try {
    document.cookie = `${COOKIE_KEY}=${sfw ? "true" : "false"}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* cookies unavailable - ignore */
  }
}

export function useComixSfw(): [boolean, (next: boolean) => void] {
  const [sfw, setSfw] = useState<boolean>(true);

  useEffect(() => {
    setSfw(readStoredSfw());
  }, []);

  const update = useCallback((next: boolean) => {
    setSfw(next);
    writeStoredSfw(next);
  }, []);

  return [sfw, update];
}

export function ComixSfwToggle({ sfw, onChange }: { sfw: boolean; onChange: (next: boolean) => void }) {
  const handleToggle = () => {
    if (sfw) {
      const confirmed = window.confirm(
        "Disabling the SFW filter may show mature content (including pornographic titles from unofficial sources).\n\nOnly continue if viewing such content is legal in your jurisdiction and you confirm you are an adult."
      );
      if (!confirmed) return;
    }
    onChange(!sfw);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      role="switch"
      aria-checked={sfw}
      aria-label={sfw ? "SFW filter is on. Click to allow mature content." : "SFW filter is off. Click to re-enable SFW mode."}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none ${
        sfw
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-rose-500/40 bg-rose-500/10 text-rose-400"
      }`}
    >
      {sfw ? <Shield className="h-3.5 w-3.5" aria-hidden="true" /> : <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />}
      {sfw ? "SFW on" : "Mature on"}
    </button>
  );
}