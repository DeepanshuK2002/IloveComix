"use client";

import { useUser } from "@/components/user/UserProvider";

interface ProfileHeaderProps {
  displayName?: string;
  stats?: {
    titles?: number;
    groups?: number;
    chapters?: number;
    comments?: number;
    collections?: number;
    likes?: number;
  };
}

export function ProfileHeader(props: ProfileHeaderProps) {
  const { profile, stats: liveStats } = useUser();

  const name = props.displayName || profile.displayName || "Mosimosi";
  const stats = props.stats || liveStats;

  const statItems = [
    { label: "TITLES", value: stats.titles ?? 9 },
    { label: "GROUPS", value: stats.groups ?? 0 },
    { label: "CHAPTERS", value: stats.chapters ?? 546 },
    { label: "COMMENTS", value: stats.comments ?? 3 },
    { label: "COLLECTIONS", value: stats.collections ?? 0 },
    { label: "LIKES", value: stats.likes ?? 1 },
  ];

  return (
    <div className="w-full rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 backdrop-blur-md p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
      {/* Left: Avatar and Display Name */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-fuchsia-800 text-white font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-fuchsia-600/30 shrink-0">
          {name.charAt(0).toUpperCase() || "M"}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {name}
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Member of Ilovecomix
          </p>
        </div>
      </div>

      {/* Right: Stats Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800/80">
        {statItems.map((item) => (
          <div key={item.label} className="text-center md:text-right">
            <span className="block text-base sm:text-lg font-bold text-zinc-100 font-mono">
              {item.value}
            </span>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
