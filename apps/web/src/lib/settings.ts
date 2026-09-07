export type ThemeMode = "main" | "dark" | "light";

export type ContentFilterRating =
  | "safe"
  | "suggestive"
  | "erotica"
  | "pornographic";

export type ContentLanguage = string;

export interface UserSettings {
  theme: ThemeMode;
  contentFilter: ContentFilterRating;
  language: ContentLanguage;
  contentPreferences: {
    types: string[];
    demographics: string[];
    blockedGenres: string[];
  };
}

export const ALL_TYPES = ["Manga", "Manhwa", "Manhua", "Other"];

export const CONTENT_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "zh-hk", label: "Chinese (Traditional)" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt-br", label: "Portuguese (Brazil)" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
  { code: "vi", label: "Vietnamese" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
  { code: "tr", label: "Turkish" },
  { code: "pl", label: "Polish" },
  { code: "uk", label: "Ukrainian" },
] as const;

export const ALL_DEMOGRAPHICS = ["Shounen", "Shoujo", "Seinen", "Josei"];

export const ALL_GENRES = [
  "Romance",
  "Drama",
  "Comedy",
  "Fantasy",
  "Slice of Life",
  "Action",
  "Boys Love",
  "Adult",
  "Adventure",
  "Smut",
  "Psychological",
  "Mystery",
  "Mature",
  "Historical",
  "Tragedy",
  "Sci-Fi",
  "Ecchi",
  "Horror",
  "Girls Love",
  "Harem",
  "Isekai",
  "Hentai",
  "Thriller",
  "Sports",
  "Crime",
  "Philosophical",
  "Mecha",
  "Wuxia",
  "Medical",
  "Superhero",
  "Magical Girls",
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "main",
  contentFilter: "suggestive",
  language: "en",
  contentPreferences: {
    types: [...ALL_TYPES],
    demographics: [...ALL_DEMOGRAPHICS],
    blockedGenres: [],
  },
};

const STORAGE_KEY = "ilovecomix-user-settings";

export function getUserSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme || DEFAULT_SETTINGS.theme,
      contentFilter: parsed.contentFilter || DEFAULT_SETTINGS.contentFilter,
      language: parsed.language || DEFAULT_SETTINGS.language,
      contentPreferences: {
        types: parsed.contentPreferences?.types || DEFAULT_SETTINGS.contentPreferences.types,
        demographics:
          parsed.contentPreferences?.demographics ||
          DEFAULT_SETTINGS.contentPreferences.demographics,
        blockedGenres:
          parsed.contentPreferences?.blockedGenres ||
          DEFAULT_SETTINGS.contentPreferences.blockedGenres,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Also sync theme storage key for ThemeProvider
    localStorage.setItem("ilovecomix-theme", settings.theme);
    // Sync cookie for SSR rendering
    document.cookie = `ilovecomix-content-filter=${settings.contentFilter}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `ilovecomix-language=${encodeURIComponent(settings.language)}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(
      new CustomEvent("ilovecomix-settings-changed", { detail: settings })
    );
  } catch (err) {
    console.error("Failed to save user settings:", err);
  }
}

export function resetUserSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem("ilovecomix-theme", DEFAULT_SETTINGS.theme);
    document.cookie = `ilovecomix-content-filter=${DEFAULT_SETTINGS.contentFilter}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `ilovecomix-language=${DEFAULT_SETTINGS.language}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(
      new CustomEvent("ilovecomix-settings-changed", { detail: DEFAULT_SETTINGS })
    );
  } catch (err) {
    console.error("Failed to reset user settings:", err);
  }
  return DEFAULT_SETTINGS;
}
