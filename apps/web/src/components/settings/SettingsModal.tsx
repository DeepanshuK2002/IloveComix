"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Check } from "lucide-react";
import {
  getUserSettings,
  saveUserSettings,
  resetUserSettings,
  type UserSettings,
  type ContentFilterRating,
  ALL_TYPES,
  ALL_DEMOGRAPHICS,
  ALL_GENRES,
} from "@/lib/settings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTENT_FILTER_OPTIONS: {
  id: ContentFilterRating;
  title: string;
  badge?: string;
  badgeClass?: string;
  description: string;
}[] = [
  {
    id: "safe",
    title: "Safe",
    description: "Family-friendly content suitable for all ages. Zero mature themes.",
  },
  {
    id: "suggestive",
    title: "Suggestive",
    badge: "RECOMMENDED",
    badgeClass: "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/30",
    description: "Includes mild fan service, romantic comedy, and light ecchi.",
  },
  {
    id: "erotica",
    title: "Erotica",
    badge: "MATURE",
    badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    description: "Mature storytelling, psychological drama, and intense romance.",
  },
  {
    id: "pornographic",
    title: "Pornographic",
    badge: "18+",
    badgeClass: "bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30 font-bold",
    description: "Adult manhwa (Pornhwa), 18+ comics, and adult manhua.",
  },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"filter" | "preferences">("filter");
  const [settings, setSettings] = useState<UserSettings>(getUserSettings);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(getUserSettings());
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleContentFilterChange = (filter: ContentFilterRating) => {
    const updated = { ...settings, contentFilter: filter };
    setSettings(updated);
    saveUserSettings(updated);
    router.refresh();
  };

  const toggleType = (type: string) => {
    const current = settings.contentPreferences.types;
    const exists = current.includes(type);
    const updatedTypes = exists
      ? current.filter((t) => t !== type)
      : [...current, type];
    const updated = {
      ...settings,
      contentPreferences: {
        ...settings.contentPreferences,
        types: updatedTypes,
      },
    };
    setSettings(updated);
    saveUserSettings(updated);
  };

  const toggleDemographic = (demo: string) => {
    const current = settings.contentPreferences.demographics;
    const exists = current.includes(demo);
    const updatedDemos = exists
      ? current.filter((d) => d !== demo)
      : [...current, demo];
    const updated = {
      ...settings,
      contentPreferences: {
        ...settings.contentPreferences,
        demographics: updatedDemos,
      },
    };
    setSettings(updated);
    saveUserSettings(updated);
  };

  const toggleBlockedGenre = (genre: string) => {
    const current = settings.contentPreferences.blockedGenres;
    const exists = current.includes(genre);
    const updatedGenres = exists
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    const updated = {
      ...settings,
      contentPreferences: {
        ...settings.contentPreferences,
        blockedGenres: updatedGenres,
      },
    };
    setSettings(updated);
    saveUserSettings(updated);
  };

  const handleReset = () => {
    const reset = resetUserSettings();
    setSettings(reset);
    saveUserSettings(reset);
    router.refresh();
  };

  const handleDone = () => {
    saveUserSettings(settings);
    router.refresh();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-[#12141a] border border-zinc-800/90 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 text-left my-auto ring-1 ring-white/[0.06]"
      >
        {/* Sleek, Minimal Single Header with Inline Tab Switcher */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-[#161820]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white tracking-tight">Settings</h2>
            {/* Segmented Tab Pill */}
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab("filter")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "filter"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Content Filter
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "preferences"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Preferences
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "filter" ? (
            /* TAB 1: CONTENT FILTER */
            <div className="space-y-2">
              {CONTENT_FILTER_OPTIONS.map((opt) => {
                const isSelected = settings.contentFilter === opt.id;
                const is18Plus = opt.id === "pornographic";

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleContentFilterChange(opt.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer group ${
                      isSelected
                        ? is18Plus
                          ? "bg-gradient-to-r from-[#FF453A]/15 via-zinc-900/80 to-[#12141a] border-[#FF453A]/60 text-white ring-1 ring-[#FF453A]/30 shadow-md shadow-[#FF453A]/10"
                          : "bg-gradient-to-r from-zinc-800/60 to-zinc-900/60 border-zinc-700 text-white ring-1 ring-white/10"
                        : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80"
                    }`}
                  >
                    {/* Custom Radio Indicator */}
                    <div
                      className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? is18Plus
                            ? "border-[#FF453A] bg-[#FF453A]"
                            : "border-white bg-white"
                          : "border-zinc-600 bg-transparent group-hover:border-zinc-500"
                      }`}
                    >
                      {isSelected && (
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            is18Plus ? "bg-white" : "bg-black"
                          }`}
                        />
                      )}
                    </div>

                    {/* Text block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold tracking-tight ${
                            isSelected ? "text-white" : "text-zinc-200"
                          }`}
                        >
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              opt.badgeClass || ""
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* TAB 2: PREFERENCES */
            <div className="space-y-4">
              {/* TYPES */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Format Types
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TYPES.map((type) => {
                    const isChecked = settings.contentPreferences.types.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isChecked
                            ? "bg-[#FF453A]/15 border border-[#FF453A]/40 text-[#FF453A]"
                            : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DEMOGRAPHIC */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Demographic
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DEMOGRAPHICS.map((demo) => {
                    const isChecked = settings.contentPreferences.demographics.includes(demo);
                    return (
                      <button
                        key={demo}
                        type="button"
                        onClick={() => toggleDemographic(demo)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isChecked
                            ? "bg-[#FF453A]/15 border border-[#FF453A]/40 text-[#FF453A]"
                            : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{demo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BLOCKED GENRES */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Blocked Genres
                </span>
                <div className="flex flex-wrap gap-1">
                  {ALL_GENRES.map((genre) => {
                    const isBlocked = settings.contentPreferences.blockedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleBlockedGenre(genre)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                          isBlocked
                            ? "bg-rose-950/40 border border-rose-500/40 text-rose-300"
                            : "bg-zinc-900/50 border border-zinc-800/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {isBlocked && <X className="h-2.5 w-2.5 text-rose-400" />}
                        <span>{genre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Minimal, Compact Single Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800/80 bg-[#161820]">
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="bg-[#FF453A] hover:bg-[#ff5e54] text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all shadow-sm shadow-[#FF453A]/25 active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
