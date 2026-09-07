import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-primary/10 mb-6 pulse-glow">
          <History className="h-10 w-10 text-accent-primary" />
        </div>
        <h1 className="text-3xl font-extrabold mb-3">
          Reading <span className="gradient-text">History</span>
        </h1>
        <p className="text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
          Your reading history is stored locally. Sign in to sync it across
          devices.
        </p>
        <a
          href="/browse"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-semibold text-white hover:bg-accent-secondary transition-all"
        >
          Browse Manga
        </a>
      </div>
    </div>
  );
}
