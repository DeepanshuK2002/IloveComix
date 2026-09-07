"use client";

import { useState, useEffect } from "react";
import { Mail, Lock } from "lucide-react";
import { useUser } from "@/components/user/UserProvider";

export function EditProfileTab() {
  const { profile, updateProfile } = useUser();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [links, setLinks] = useState(profile.socialLinks);
  const [email, setEmail] = useState(profile.email);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setBio(profile.bio);
    setLinks(profile.socialLinks);
    setEmail(profile.email);
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      username,
      bio,
      socialLinks: links,
      email,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Edit Profile
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Update how you appear on the site. Email and password changes require
          confirmation.
        </p>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-800/80 bg-[#16181d]/90 backdrop-blur-md p-6 space-y-8 shadow-xl"
      >
        {/* 1. Avatar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-zinc-800/60 pb-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Avatar</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              JPG, PNG or WebP, up to 1 MB.
            </p>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-fuchsia-800 text-white font-bold text-xl flex items-center justify-center shadow-md border border-fuchsia-600/30 shrink-0">
              {displayName.charAt(0).toUpperCase() || "M"}
            </div>
            <label className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors">
              <span>Change avatar</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
        </div>

        {/* 2. Identity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Identity</h3>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Shown on your profile and next to your comments.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400 mb-1">
                <span>Display Name</span>
                <span>{displayName.length} / 16</span>
              </div>
              <input
                type="text"
                maxLength={16}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#DF301C]/50 focus:outline-none focus:ring-1 focus:ring-[#DF301C]/30 font-medium"
              />
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Username
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#DF301C]/50 focus:outline-none focus:ring-1 focus:ring-[#DF301C]/30 font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                Lowercase letters, numbers, dot, underscore, hyphen.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Bio</h3>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              A short blurb shown on your public profile.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400 mb-1">
              <span>About You</span>
              <span>{bio.length} / 500</span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers a little about yourself..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#DF301C]/50 focus:outline-none focus:ring-1 focus:ring-[#DF301C]/30 resize-y"
            />
          </div>
        </div>

        {/* 4. Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Social links</h3>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Optional. One link per line — only lines starting with http(s)://
              are kept, max 5.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Links
            </div>
            <textarea
              rows={3}
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder={"https://twitter.com/yourhandle\nhttps://bsky.app/profile/you.bsky.social\nhttps://your-site.com"}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#DF301C]/50 focus:outline-none focus:ring-1 focus:ring-[#DF301C]/30 font-mono resize-y"
            />
          </div>
        </div>

        {/* 5. Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Email</h3>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Used for sign-in and notifications.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Email Address
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#DF301C]/50 focus:outline-none focus:ring-1 focus:ring-[#DF301C]/30 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 6. Password */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Password</h3>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Leave blank to keep your current password. Minimum 6 characters.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">
                New Password
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#DF301C]/50 focus:outline-none focus:ring-1 focus:ring-[#DF301C]/30"
                />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Confirm New Password
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#DF301C]/50 focus:outline-none focus:ring-1 focus:ring-[#DF301C]/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
          {savedMessage ? (
            <span className="text-xs font-semibold text-emerald-400">
              ✓ Changes saved successfully
            </span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="bg-[#DF301C] hover:bg-[#c72016] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-[#DF301C]/25 active:scale-95 cursor-pointer ml-auto"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
