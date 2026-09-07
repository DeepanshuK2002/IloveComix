import { cookies } from "next/headers";

export type UserContext = {
  language: string;
  activeRatings: string[];
};

export async function getUserContext(): Promise<UserContext> {
  const cookieStore = await cookies();
  const filter = cookieStore.get("ilovecomix-content-filter")?.value;
  const language = decodeURIComponent(
    cookieStore.get("ilovecomix-language")?.value || "en"
  );

  const activeRatings =
    filter === "pornographic"
      ? ["pornographic", "erotica"]
      : filter === "erotica"
      ? ["erotica"]
      : filter === "safe"
      ? ["safe"]
      : ["safe", "suggestive"];

  return { language, activeRatings };
}