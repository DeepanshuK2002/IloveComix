"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar, type ProfileTab } from "@/components/profile/ProfileSidebar";
import { EditProfileTab } from "@/components/profile/EditProfileTab";
import { FollowingTitlesTab } from "@/components/profile/FollowingTitlesTab";
import { FollowingUsersTab } from "@/components/profile/FollowingUsersTab";
import { FollowingGroupsTab } from "@/components/profile/FollowingGroupsTab";
import { ReadHistoryTab } from "@/components/profile/ReadHistoryTab";
import { CollectionsTab } from "@/components/profile/CollectionsTab";
import { FeedTab } from "@/components/profile/FeedTab";
import { NotificationsTab } from "@/components/profile/NotificationsTab";
import { CommentsTab } from "@/components/profile/CommentsTab";
import { UploadsTab } from "@/components/profile/UploadsTab";
import { ImportExportTab } from "@/components/profile/ImportExportTab";
import { ProfileSettingsTab } from "@/components/profile/ProfileSettingsTab";

function ProfileContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ProfileTab) || "edit-profile";
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as ProfileTab;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* 1. Header with Stats */}
      <ProfileHeader />

      {/* 2. Main Body: Sidebar + Active Tab Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <ProfileSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.history.replaceState(null, "", `/profile?tab=${tab}`);
          }}
        />

        <main className="flex-1 w-full min-w-0">
          {activeTab === "edit-profile" && <EditProfileTab />}
          {activeTab === "following-titles" && <FollowingTitlesTab />}
          {activeTab === "following-users" && <FollowingUsersTab />}
          {activeTab === "following-groups" && <FollowingGroupsTab />}
          {activeTab === "read-history" && <ReadHistoryTab />}
          {activeTab === "collections" && <CollectionsTab />}
          {activeTab === "feed" && <FeedTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "comments" && <CommentsTab />}
          {activeTab === "uploaded-chapters" && <UploadsTab />}
          {activeTab === "import-export" && <ImportExportTab />}
          {activeTab === "settings" && <ProfileSettingsTab />}
        </main>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 text-center text-zinc-500 font-mono text-sm">
          Loading profile...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
