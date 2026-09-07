import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.max(0, now.getTime() - date.getTime());
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  } catch {
    return "Recently";
  }
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "ongoing":
      return "badge-success";
    case "completed":
      return "badge-info";
    case "hiatus":
      return "badge-warning";
    case "cancelled":
      return "badge-error";
    default:
      return "badge-ghost";
  }
}

export function getTypeColor(type: string | null): string {
  switch (type) {
    case "manga":
      return "badge-primary";
    case "manhwa":
      return "badge-secondary";
    case "manhua":
      return "badge-accent";
    default:
      return "badge-ghost";
  }
}

export function getContentRatingColor(rating: string): string {
  switch (rating) {
    case "safe":
      return "badge-success";
    case "suggestive":
      return "badge-warning";
    case "erotica":
      return "badge-error";
    case "pornographic":
      return "badge-error";
    default:
      return "badge-ghost";
  }
}

export function getStatusBadge(status: string): { label: string; dotColor: string; className: string } {
  switch (status?.toLowerCase()) {
    case "ongoing":
      return {
        label: "Ongoing",
        dotColor: "bg-emerald-400",
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      };
    case "completed":
      return {
        label: "Completed",
        dotColor: "bg-sky-400",
        className: "border-sky-500/20 bg-sky-500/10 text-sky-400",
      };
    case "hiatus":
      return {
        label: "Hiatus",
        dotColor: "bg-amber-400",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        dotColor: "bg-rose-400",
        className: "border-rose-500/20 bg-rose-500/10 text-rose-400",
      };
    default:
      return {
        label: status || "Unknown",
        dotColor: "bg-zinc-400",
        className: "border-zinc-800 bg-zinc-900/80 text-zinc-400",
      };
  }
}

export function getTypeBadge(type: string | null): { label: string; className: string } {
  switch (type?.toLowerCase()) {
    case "manga":
      return {
        label: "MANGA",
        className: "border-zinc-800 bg-zinc-900/90 text-zinc-300",
      };
    case "manhwa":
      return {
        label: "MANHWA",
        className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
      };
    case "manhua":
      return {
        label: "MANHUA",
        className: "border-purple-500/30 bg-purple-500/10 text-purple-300",
      };
    default:
      return {
        label: (type || "COMIC").toUpperCase(),
        className: "border-zinc-800 bg-zinc-900/90 text-zinc-300",
      };
  }
}

