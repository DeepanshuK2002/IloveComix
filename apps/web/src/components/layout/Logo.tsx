"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getUserSettings, type UserSettings } from "@/lib/settings";

interface LogoProps {
  className?: string;
  priority?: boolean;
}

export function Logo({ className = "h-8 w-auto object-contain", priority = false }: LogoProps) {
  const { theme } = useTheme();
  const [isAdult, setIsAdult] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const settings = getUserSettings();
    setIsAdult(settings.contentFilter === "pornographic");

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserSettings>;
      if (customEvent.detail) {
        setIsAdult(customEvent.detail.contentFilter === "pornographic");
      } else {
        const fresh = getUserSettings();
        setIsAdult(fresh.contentFilter === "pornographic");
      }
    };

    window.addEventListener("ilovecomix-settings-changed", handleSettingsChange);
    window.addEventListener("storage", handleSettingsChange);

    return () => {
      window.removeEventListener("ilovecomix-settings-changed", handleSettingsChange);
      window.removeEventListener("storage", handleSettingsChange);
    };
  }, []);

  const currentTheme = mounted ? theme : "dark";
  const currentIsAdult = mounted ? isAdult : false;

  const logoSrc =
    currentTheme === "light"
      ? currentIsAdult
        ? "/logo-light-18.svg"
        : "/logo-light.svg"
      : currentIsAdult
      ? "/logo-dark-18.svg"
      : "/logo-dark.svg";

  const width = currentIsAdult ? 158 : 112;

  return (
    <Image
      src={logoSrc}
      alt={currentIsAdult ? "Ilovecomix 18+" : "Ilovecomix"}
      width={width}
      height={32}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
