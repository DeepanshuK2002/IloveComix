"use client";

import { useState } from "react";
import {
  Settings,
  X,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Minus,
  Plus,
  Ban,
  Sun,
  Palette,
  Eye,
  Sliders,
  Play,
  Pause,
} from "lucide-react";

export type ReaderMode = "webtoon" | "page";
export type FitMode = "width" | "contain";
export type DirMode = "ltr" | "rtl" | "vertical";
export type ScrollType = "fast" | "smooth";
export type ProgressBarPosition = "left" | "top" | "bottom" | "right" | "none";
export type PreloadMode = "some" | "all";

export interface ReaderSettingsValue {
  mode: ReaderMode;
  fit: FitMode;
  direction: DirMode;
  brightness: number;
  customBg: string;
  customText: string;
  useCustomTheme: boolean;
  tapZones: boolean;
  showControls: boolean;
  // New settings matching screenshot
  stripMargin: number; // in pixels (default 0)
  scrollSpeed: ScrollType; // "fast" | "smooth"
  scrollStepPercent: number; // default 100
  progressBarPosition: ProgressBarPosition; // "left" | "top" | "bottom" | "right" | "none"
  preloadMode: PreloadMode; // "some" | "all"
  greyscale: boolean;
  autoScrollEnabled?: boolean;
  autoScrollSpeed?: number; // 1 - 10
}

interface ReaderSettingsProps {
  settings: ReaderSettingsValue;
  onChange: (settings: ReaderSettingsValue) => void;
  onClose: () => void;
}

const PRESETS = [
  { name: "Pitch Black", bg: "#050507", text: "#ffffff" },
  { name: "Midnight", bg: "#0f0f0f", text: "#ffffff" },
  { name: "Dark Blue", bg: "#1a1a2e", text: "#e2e8f0" },
  { name: "Sepia", bg: "#fef3c7", text: "#78350f" },
];

export function ReaderSettings({
  settings,
  onChange,
  onClose,
}: ReaderSettingsProps) {
  const [activeTab, setActiveTab] = useState<"general" | "theme">("general");

  const update = (partial: Partial<ReaderSettingsValue>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      {/* Close on click outside */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Settings Dialog Modal (matching screenshot 022420.png) */}
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-[#14151b] border border-zinc-800 shadow-2xl text-zinc-200 select-none z-10 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#14151b]/95 backdrop-blur-md px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-tight">Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher: General (Screenshot layout) | Theme & Display */}
        <div className="flex border-b border-zinc-800/80 bg-[#101116] px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === "general"
                ? "text-indigo-400 border-indigo-500 font-bold"
                : "text-zinc-400 border-transparent hover:text-zinc-200"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Reading & Controls
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("theme")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === "theme"
                ? "text-indigo-400 border-indigo-500 font-bold"
                : "text-zinc-400 border-transparent hover:text-zinc-200"
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Theme & Display
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
          {activeTab === "general" ? (
            <>
              {/* 1. READING DIRECTION (matching screenshot) */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2.5 block">
                  Reading Direction
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => update({ direction: "ltr", mode: "page" })}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      settings.direction === "ltr" && settings.mode === "page"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 shadow-md font-semibold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>Left to right</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => update({ direction: "rtl", mode: "page" })}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      settings.direction === "rtl" && settings.mode === "page"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 shadow-md font-semibold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Right to left</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => update({ direction: "vertical", mode: "webtoon" })}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      settings.direction === "vertical" || settings.mode === "webtoon"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 shadow-md font-semibold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    <span>Top to bottom</span>
                  </button>
                </div>
              </div>

              {/* 2. STRIP MARGIN (matching screenshot) */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2.5 block">
                  Strip Margin
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between bg-[#1a1c24] border border-zinc-800/90 rounded-xl px-3 py-2">
                    <button
                      type="button"
                      onClick={() => update({ stripMargin: Math.max(0, (settings.stripMargin || 0) - 4) })}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Decrease margin"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white">
                      {settings.stripMargin || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => update({ stripMargin: Math.min(64, (settings.stripMargin || 0) + 4) })}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Increase margin"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => update({ stripMargin: 0 })}
                    className="px-4 py-2 bg-[#1a1c24] border border-zinc-800/90 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* 3. KEYBOARD SCROLLING (matching screenshot) */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2.5 block">
                  Keyboard Scrolling
                </label>
                {/* Scroll Fast / Scroll Smooth radio pills */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => update({ scrollSpeed: "fast" })}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      (settings.scrollSpeed || "fast") === "fast"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 font-semibold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                      (settings.scrollSpeed || "fast") === "fast" ? "border-indigo-400" : "border-zinc-500"
                    }`}>
                      {(settings.scrollSpeed || "fast") === "fast" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      )}
                    </div>
                    <span>Scroll fast</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => update({ scrollSpeed: "smooth" })}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      settings.scrollSpeed === "smooth"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 font-semibold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                      settings.scrollSpeed === "smooth" ? "border-indigo-400" : "border-zinc-500"
                    }`}>
                      {settings.scrollSpeed === "smooth" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      )}
                    </div>
                    <span>Scroll smooth</span>
                  </button>
                </div>

                {/* Step size percentage control */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between bg-[#1a1c24] border border-zinc-800/90 rounded-xl px-3 py-2">
                    <button
                      type="button"
                      onClick={() => update({ scrollStepPercent: Math.max(20, (settings.scrollStepPercent || 100) - 10) })}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Decrease step"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white">
                      {settings.scrollStepPercent || 100}%
                    </span>
                    <button
                      type="button"
                      onClick={() => update({ scrollStepPercent: Math.min(200, (settings.scrollStepPercent || 100) + 10) })}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Increase step"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => update({ scrollStepPercent: 100 })}
                    className="px-4 py-2 bg-[#1a1c24] border border-zinc-800/90 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 leading-tight">
                  Step size for Arrow / Space / W / S keys, as percent of the viewport height.
                </p>
              </div>

              {/* 4. AUTO SCROLL (User defined speed) */}
              <div className="bg-[#1a1c24] border border-zinc-800/90 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      Auto Scroll
                      {settings.autoScrollEnabled && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold">
                          Active
                        </span>
                      )}
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      Smooth hands-free scrolling at your preferred speed
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      update({ autoScrollEnabled: !settings.autoScrollEnabled })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.autoScrollEnabled ? "bg-indigo-600" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoScrollEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Scroll Speed Controls */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Scroll Speed</span>
                    <span className="font-bold text-indigo-300">
                      Level {settings.autoScrollSpeed || 3} ({((settings.autoScrollSpeed || 3) * 35)} px/s)
                    </span>
                  </div>

                  {/* Range Slider 1 - 10 */}
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={settings.autoScrollSpeed || 3}
                    onChange={(e) =>
                      update({ autoScrollSpeed: Number(e.target.value) })
                    }
                    className="range range-xs w-full accent-indigo-500 cursor-pointer"
                  />

                  {/* Preset Speed Buttons */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {[
                      { label: "Slow", val: 1 },
                      { label: "Casual", val: 3 },
                      { label: "Normal", val: 5 },
                      { label: "Fast", val: 7 },
                      { label: "Max", val: 10 },
                    ].map((p) => {
                      const isActive =
                        (settings.autoScrollSpeed || 3) === p.val;
                      return (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => update({ autoScrollSpeed: p.val })}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-mono transition-all text-center ${
                            isActive
                              ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 font-bold"
                              : "bg-[#101116] text-zinc-400 border border-zinc-800 hover:text-white"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Fine Tuning +/- Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 flex items-center justify-between bg-[#101116] border border-zinc-800 rounded-lg px-2.5 py-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          update({
                            autoScrollSpeed: Math.max(
                              1,
                              (settings.autoScrollSpeed || 3) - 1
                            ),
                          })
                        }
                        className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Decrease speed"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white">
                        Speed {settings.autoScrollSpeed || 3} / 10
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          update({
                            autoScrollSpeed: Math.min(
                              10,
                              (settings.autoScrollSpeed || 3) + 1
                            ),
                          })
                        }
                        className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Increase speed"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => update({ autoScrollSpeed: 3 })}
                      className="px-3 py-1.5 bg-[#101116] border border-zinc-800 hover:bg-zinc-800 rounded-lg text-[11px] font-mono text-zinc-400 hover:text-white"
                    >
                      Reset (3)
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. PROGRESS BAR POSITION (matching screenshot) */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2.5 block">
                  Progress Bar
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {/* Left */}
                  <button
                    type="button"
                    onClick={() => update({ progressBarPosition: "left" })}
                    className={`flex items-center justify-center p-3 rounded-xl border text-sm transition-all ${
                      (settings.progressBarPosition || "left") === "left"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 shadow font-bold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-white"
                    }`}
                    title="Left vertical bar"
                  >
                    ←
                  </button>

                  {/* Top */}
                  <button
                    type="button"
                    onClick={() => update({ progressBarPosition: "top" })}
                    className={`flex items-center justify-center p-3 rounded-xl border text-sm transition-all ${
                      settings.progressBarPosition === "top"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 shadow font-bold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-white"
                    }`}
                    title="Top horizontal bar"
                  >
                    ↑
                  </button>

                  {/* Bottom */}
                  <button
                    type="button"
                    onClick={() => update({ progressBarPosition: "bottom" })}
                    className={`flex items-center justify-center p-3 rounded-xl border text-sm transition-all ${
                      settings.progressBarPosition === "bottom"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 shadow font-bold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-white"
                    }`}
                    title="Bottom horizontal bar"
                  >
                    ↓
                  </button>

                  {/* Right */}
                  <button
                    type="button"
                    onClick={() => update({ progressBarPosition: "right" })}
                    className={`flex items-center justify-center p-3 rounded-xl border text-sm transition-all ${
                      settings.progressBarPosition === "right"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 shadow font-bold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-white"
                    }`}
                    title="Right vertical bar"
                  >
                    →
                  </button>

                  {/* None */}
                  <button
                    type="button"
                    onClick={() => update({ progressBarPosition: "none" })}
                    className={`flex items-center justify-center p-3 rounded-xl border text-sm transition-all ${
                      settings.progressBarPosition === "none"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 shadow font-bold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-white"
                    }`}
                    title="Hide progress bar"
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* 5. PRELOAD IMAGES (matching screenshot) */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2.5 block">
                  Preload Images
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update({ preloadMode: "some" })}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      (settings.preloadMode || "some") === "some"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 font-semibold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                      (settings.preloadMode || "some") === "some" ? "border-indigo-400" : "border-zinc-500"
                    }`}>
                      {(settings.preloadMode || "some") === "some" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      )}
                    </div>
                    <span>Preload some</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => update({ preloadMode: "all" })}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      settings.preloadMode === "all"
                        ? "bg-[#292644] border-indigo-500/50 text-indigo-300 font-semibold"
                        : "bg-[#1a1c24] border-zinc-800/90 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                      settings.preloadMode === "all" ? "border-indigo-400" : "border-zinc-500"
                    }`}>
                      {settings.preloadMode === "all" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      )}
                    </div>
                    <span>Preload all</span>
                  </button>
                </div>
              </div>

              {/* 6. GREYSCALE PAGES CHECKBOX (matching screenshot) */}
              <div className="bg-[#1a1c24] border border-zinc-800/90 rounded-xl p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.greyscale || false}
                    onChange={(e) => update({ greyscale: e.target.checked })}
                    className="h-4 w-4 rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-zinc-300 select-none">
                    Greyscale pages
                  </span>
                </label>
              </div>
            </>
          ) : (
            /* Theme & Display tab (Retaining all existing options) */
            <>
              {/* Brightness */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2 block">
                  Brightness ({settings.brightness}%)
                </label>
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4 text-zinc-500 shrink-0" />
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={settings.brightness}
                    onChange={(e) => update({ brightness: Number(e.target.value) })}
                    className="range range-xs flex-1 accent-[#DF301C]"
                  />
                </div>
              </div>

              {/* Canvas Theme Presets */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2 block">
                  Canvas Background Preset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        update({
                          useCustomTheme: true,
                          customBg: preset.bg,
                          customText: preset.text,
                        })
                      }
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs transition-all ${
                        settings.customBg === preset.bg
                          ? "border-indigo-500 bg-indigo-500/15 text-white font-semibold"
                          : "border-zinc-800 bg-[#1a1c24] text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: preset.bg }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Fit Mode */}
              <div>
                <label className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase mb-2 block">
                  Image Fit
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update({ fit: "width" })}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      settings.fit === "width"
                        ? "border-indigo-500 bg-indigo-500/15 text-white"
                        : "border-zinc-800 bg-[#1a1c24] text-zinc-400 hover:text-white"
                    }`}
                  >
                    Fit to Width
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ fit: "contain" })}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      settings.fit === "contain"
                        ? "border-indigo-500 bg-indigo-500/15 text-white"
                        : "border-zinc-800 bg-[#1a1c24] text-zinc-400 hover:text-white"
                    }`}
                  >
                    Fit to Screen
                  </button>
                </div>
              </div>

              {/* Tap Zones & Controls */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#1a1c24] border border-zinc-800/80 cursor-pointer">
                  <span className="text-xs font-medium text-zinc-300">Tap Zones Navigation</span>
                  <input
                    type="checkbox"
                    checked={settings.tapZones}
                    onChange={(e) => update({ tapZones: e.target.checked })}
                    className="h-4 w-4 rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#1a1c24] border border-zinc-800/80 cursor-pointer">
                  <span className="text-xs font-medium text-zinc-300">Show Floating Controls</span>
                  <input
                    type="checkbox"
                    checked={settings.showControls}
                    onChange={(e) => update({ showControls: e.target.checked })}
                    className="h-4 w-4 rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
