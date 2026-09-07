// Terms used to identify "hentai related" tags. Titles carrying any of these
// are only surfaced while the Pornographic (18+) content filter is active.
const ADULT_TAG_TERMS = [
  "hentai",
  "smut",
  "porn",
  "adultery",
  "netorare",
  "netori",
  "ntr",
  "cuckold",
  "sexual violence",
  "nudity",
  "explicit",
  "lolicon",
  "shotacon",
  "guro",
  "bdsm",
  "incest",
  "dubious consent",
  "rape",
];

export function isAdultTagName(name: string): boolean {
  const n = name.toLowerCase();
  return ADULT_TAG_TERMS.some((t) => n.includes(t));
}

export function hasAdultTags(
  tags: { name: string }[] | undefined | null
): boolean {
  return !!(tags && tags.some((t) => isAdultTagName(t.name)));
}