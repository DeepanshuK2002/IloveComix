"use client";

import { useState } from "react";
import { Download, Upload, RefreshCw, UploadCloud } from "lucide-react";

export function ImportExportTab() {
  const [activeSubTab, setActiveSubTab] = useState<
    "import" | "export" | "sync"
  >("import");
  const [source, setSource] = useState("MyAnimeList");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [statusMsg, setStatusMsg] = useState("");

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("Importing titles... (simulated sync complete)");
    setTimeout(() => setStatusMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Import / Export / Sync
        </h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Bring your follow list over from MyAnimeList, AniList, MangaUpdates,
          Comick, or a plain text file. Export your current list for backup, or
          connect AniList / MangaBaka to auto-sync your read progress as you
          read.
        </p>
      </div>

      {/* Main Tabs: Import | Export | Sync */}
      <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("import")}
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === "import"
              ? "text-white border-b-2 border-[#DF301C] pb-2 -mb-2"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Import</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("export")}
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === "export"
              ? "text-white border-b-2 border-[#DF301C] pb-2 -mb-2"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("sync")}
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === "sync"
              ? "text-white border-b-2 border-[#DF301C] pb-2 -mb-2"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === "import" && (
        <form
          onSubmit={handleImport}
          className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 backdrop-blur-md p-6 space-y-6 shadow-xl"
        >
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Import</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Lists must be public when importing by username. Titles that aren't
              in our catalog will be skipped. The process can take a few minutes
              for large lists.
            </p>
          </div>

          {/* Source options */}
          <div>
            <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-2">
              Source
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                "MyAnimeList",
                "AniList",
                "MangaUpdates",
                "Comick",
                "File",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    source === s
                      ? "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/40 font-semibold"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div>
            <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="MAL username"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#DF301C]/50 focus:outline-none"
            />
          </div>

          {/* or File dropzone */}
          <div>
            <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
              or File
            </span>
            <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 transition-colors cursor-pointer text-center">
              <UploadCloud className="h-8 w-8 text-zinc-500 mb-2" />
              <p className="text-xs font-semibold text-zinc-300">
                Choose a file
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                or drop it here · .xml
              </p>
              <input type="file" accept=".xml,.json,.txt" className="hidden" />
            </label>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
              Upload .xml file exported from MyAnimeList.
            </p>
          </div>

          {/* Mode: Merge | Replace */}
          <div>
            <span className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Import Mode
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("merge")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  mode === "merge"
                    ? "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/40 font-semibold"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Merge
              </button>
              <button
                type="button"
                onClick={() => setMode("replace")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  mode === "replace"
                    ? "bg-[#DF301C]/15 text-[#DF301C] border border-[#DF301C]/40 font-semibold"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Replace
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
              Merge keeps your current list and adds the imported titles.
              Replace deletes your current list first.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
            {statusMsg && (
              <span className="text-xs text-emerald-400 font-semibold">
                ✓ {statusMsg}
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#DF301C] hover:bg-[#c72016] text-white font-bold text-xs transition-all shadow-md shadow-[#DF301C]/25 active:scale-95 ml-auto cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Import</span>
            </button>
          </div>
        </form>
      )}

      {activeSubTab === "export" && (
        <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 p-8 text-center space-y-4 shadow-xl">
          <Download className="h-10 w-10 text-[#DF301C] mx-auto" />
          <h3 className="text-base font-bold text-zinc-100">
            Export Your Library
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Download your bookmarks, reading history, and custom folders as JSON
            or XML for backup.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DF301C] hover:bg-[#c72016] text-white font-bold text-xs transition-all shadow-md shadow-[#DF301C]/25 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Backup (.json)</span>
          </button>
        </div>
      )}

      {activeSubTab === "sync" && (
        <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 p-8 text-center space-y-4 shadow-xl">
          <RefreshCw className="h-10 w-10 text-[#DF301C] mx-auto" />
          <h3 className="text-base font-bold text-zinc-100">
            Connect AniList or MangaBaka
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Automatically sync chapter read progress in real time as you read on
            Ilovecomix.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#02A9FF] hover:bg-[#0295e0] text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <span>Connect AniList Account</span>
          </button>
        </div>
      )}
    </div>
  );
}
