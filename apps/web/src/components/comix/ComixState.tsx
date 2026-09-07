"use client";

import { RefreshCw, SearchX, TriangleAlert } from "lucide-react";

interface ComixStateProps {
  kind: "empty" | "error" | "unavailable";
  title: string;
  hint?: string;
  onRetry?: () => void;
}

export function ComixState({ kind, title, hint, onRetry }: ComixStateProps) {
  const Icon =
    kind === "error" ? TriangleAlert : kind === "unavailable" ? TriangleAlert : SearchX;
  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-card flex flex-col items-center gap-3 rounded-2xl border border-zinc-800/80 p-10 text-center"
    >
      <Icon className="h-8 w-8 text-zinc-500" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-zinc-200">{title}</p>
        {hint && <p className="max-w-md text-xs leading-relaxed text-zinc-500">{hint}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}