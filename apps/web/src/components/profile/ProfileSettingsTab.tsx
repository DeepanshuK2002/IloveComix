"use client";

import { useUser } from "@/components/user/UserProvider";

export function ProfileSettingsTab() {
  const { settings, updateSettings } = useUser();

  const hideWall = settings.profileVisibility.hideWall;
  const hideComments = settings.profileVisibility.hideRecentComments;
  const hideReads = settings.profileVisibility.hideRecentReads;
  const hideStats = settings.profileVisibility.hideStats;

  const showFollowing = settings.homePage.showFollowingTitles;
  const showHistory = settings.homePage.showReadingHistory;
  const homeFolders = settings.homePage.folders;

  const autoLoadComments = settings.comments.autoLoadComments;
  const notifFolders = settings.notifications.folders;
  const notifyLikes = settings.notifications.notifyOnCommentLikes;

  const setHideWall = (val: boolean) =>
    updateSettings({
      profileVisibility: { ...settings.profileVisibility, hideWall: val },
    });
  const setHideComments = (val: boolean) =>
    updateSettings({
      profileVisibility: { ...settings.profileVisibility, hideRecentComments: val },
    });
  const setHideReads = (val: boolean) =>
    updateSettings({
      profileVisibility: { ...settings.profileVisibility, hideRecentReads: val },
    });
  const setHideStats = (val: boolean) =>
    updateSettings({
      profileVisibility: { ...settings.profileVisibility, hideStats: val },
    });

  const setShowFollowing = (val: boolean) =>
    updateSettings({
      homePage: { ...settings.homePage, showFollowingTitles: val },
    });
  const setShowHistory = (val: boolean) =>
    updateSettings({
      homePage: { ...settings.homePage, showReadingHistory: val },
    });
  const setHomeFolder = (key: string, val: boolean) =>
    updateSettings({
      homePage: {
        ...settings.homePage,
        folders: { ...settings.homePage.folders, [key]: val },
      },
    });

  const setAutoLoadComments = (val: boolean) =>
    updateSettings({
      comments: { ...settings.comments, autoLoadComments: val },
    });

  const setNotifFolder = (key: string, val: boolean) =>
    updateSettings({
      notifications: {
        ...settings.notifications,
        folders: { ...settings.notifications.folders, [key]: val },
      },
    });
  const setNotifyLikes = (val: boolean) =>
    updateSettings({
      notifications: {
        ...settings.notifications,
        notifyOnCommentLikes: val,
      },
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Control which sections appear on your public profile.
        </p>
      </div>

      {/* 1. Profile Visibility (matching Screenshot 212713) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 backdrop-blur-md p-6 space-y-5 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Profile visibility</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Hidden sections won't show as a tab on your profile to other
            visitors.
          </p>
        </div>

        <div className="divide-y divide-zinc-800/40">
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Hide wall</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Visitors can't see or post to the message wall on your profile.
              </p>
            </div>
            <input
              type="checkbox"
              checked={hideWall}
              onChange={(e) => setHideWall(e.target.checked)}
              className="toggle toggle-sm bg-zinc-700 checked:bg-[#DF301C] border-0"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">
                Hide recent comments
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Don't expose comments you've made on titles or chapters
                publicly.
              </p>
            </div>
            <input
              type="checkbox"
              checked={hideComments}
              onChange={(e) => setHideComments(e.target.checked)}
              className="toggle toggle-sm bg-zinc-700 checked:bg-[#DF301C] border-0"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">
                Hide recent reads
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Don't expose your recent reading history publicly.
              </p>
            </div>
            <input
              type="checkbox"
              checked={hideReads}
              onChange={(e) => setHideReads(e.target.checked)}
              className="toggle toggle-sm bg-zinc-700 checked:bg-[#DF301C] border-0"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Hide stats</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Hide the Stats tab (reading heatmap, top genres, folder
                breakdown) from your public profile.
              </p>
            </div>
            <input
              type="checkbox"
              checked={hideStats}
              onChange={(e) => setHideStats(e.target.checked)}
              className="toggle toggle-sm bg-zinc-700 checked:bg-[#DF301C] border-0"
            />
          </div>
        </div>
      </div>

      {/* 2. Home Page (matching Screenshot 212713) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 backdrop-blur-md p-6 space-y-5 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Home page</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Choose which personal rails appear on the home page.
          </p>
        </div>

        <div className="divide-y divide-zinc-800/40">
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">
                Show following titles
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Rail of new chapters from comics you follow.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showFollowing}
              onChange={(e) => setShowFollowing(e.target.checked)}
              className="toggle toggle-sm bg-zinc-700 checked:bg-[#DF301C] border-0"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">
                Show reading history
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Rail of titles you've recently been reading.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showHistory}
              onChange={(e) => setShowHistory(e.target.checked)}
              className="toggle toggle-sm bg-zinc-700 checked:bg-[#DF301C] border-0"
            />
          </div>
        </div>

        {/* Following titles folders */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-zinc-200">
            Following titles folders
          </h4>
          <p className="text-[11px] text-zinc-500 mt-0.5 mb-3">
            Folders shown in the "New Chapters from Followed Comics" rail on the
            home page.
          </p>

          <div className="space-y-2">
            {[
              { id: "reading", label: "Reading" },
              { id: "completed", label: "Completed" },
              { id: "onHold", label: "On-Hold" },
              { id: "planToRead", label: "Plan to Read" },
              { id: "dropped", label: "Dropped" },
            ].map((f) => (
              <label
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60 hover:bg-zinc-850 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={homeFolders[f.id as keyof typeof homeFolders]}
                    onChange={(e) => setHomeFolder(f.id, e.target.checked)}
                    className="checkbox checkbox-xs border-zinc-600 checked:border-[#DF301C] checked:bg-[#DF301C]"
                  />
                  <span className="text-xs font-medium text-zinc-200">
                    {f.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                  built-in
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Comments (matching Screenshot 212713) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 backdrop-blur-md p-6 space-y-4 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Comments</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Control how comments load on title and reader pages.
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">
              Auto-load comments
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              When off, title and reader pages show a button to load comments
              manually.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoLoadComments}
            onChange={(e) => setAutoLoadComments(e.target.checked)}
            className="toggle toggle-sm bg-zinc-700 checked:bg-[#DF301C] border-0"
          />
        </div>
      </div>

      {/* 4. Notifications (matching Screenshot 212713) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 backdrop-blur-md p-6 space-y-5 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Notifications</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Choose which folders should send new-chapter notifications.
          </p>
        </div>

        <div className="space-y-2">
          {[
            { id: "reading", label: "Reading" },
            { id: "completed", label: "Completed" },
            { id: "onHold", label: "On-Hold" },
            { id: "planToRead", label: "Plan to Read" },
            { id: "dropped", label: "Dropped" },
          ].map((f) => (
            <label
              key={f.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60 hover:bg-zinc-850 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={notifFolders[f.id as keyof typeof notifFolders]}
                  onChange={(e) => setNotifFolder(f.id, e.target.checked)}
                  className="checkbox checkbox-xs border-zinc-600 checked:border-[#DF301C] checked:bg-[#DF301C]"
                />
                <span className="text-xs font-medium text-zinc-200">
                  {f.label}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                built-in
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">
              Notify me when someone likes my comment
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Turn off to stop receiving notifications when your comments reach
              a like milestone.
            </p>
          </div>
          <input
            type="checkbox"
            checked={notifyLikes}
            onChange={(e) => setNotifyLikes(e.target.checked)}
            className="toggle toggle-sm bg-zinc-700 checked:bg-[#DF301C] border-0"
          />
        </div>
      </div>
    </div>
  );
}
