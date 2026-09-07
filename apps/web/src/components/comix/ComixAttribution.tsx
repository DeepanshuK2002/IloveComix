import { ExternalLink, Info } from "lucide-react";

const COMIX_SITE = "https://comix.to";
const COMIX_API = "https://comix-api.vercel.app";

export function ComixAttribution({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`glass-card rounded-2xl border border-zinc-800/80 p-4 ${compact ? "" : "mt-6"}`}
      role="note"
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
        <div className="space-y-1.5 text-xs leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-300">
            Unofficial third-party data source
          </p>
          <p>
            The Comix library is powered by an unofficial community API (
            <a
              href={COMIX_API}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-[#DF301C] hover:underline focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none rounded"
            >
              comix-api.vercel.app <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            ) that proxies{" "}
            <a
              href={COMIX_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-zinc-300 hover:text-white hover:underline focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none rounded"
            >
              comix.to <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            . We are not affiliated with Comix.to or any scanlation group.
          </p>
          <p>
            Metadata remains the property of Comix.to and its content partners.
            Chapter pages are streamed on demand and are never downloaded,
            re-hosted, mirrored, or redistributed by this application. Before
            making public chapter reading available, review Comix.to's terms,
            copyright requirements, and obtain permission from the relevant
            rights holders and scanlation groups.
          </p>
        </div>
      </div>
    </div>
  );
}