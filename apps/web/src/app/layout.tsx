import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Ilovecomix - Read Manga Online for Free",
  description:
    "Read manga, manhwa, manhua online for free. Updated daily with the latest chapters.",
  keywords: [
    "read manga online",
    "manga reader",
    "manhwa online",
    "webtoon",
    "free comics",
  ],
};

// Prevent theme flash on load
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('ilovecomix-theme');
      if (t !== 'light' && t !== 'dark') t = 'dark';
      var root = document.documentElement;
      root.classList.add(t);
      root.classList.remove(t === 'dark' ? 'light' : 'dark');
      root.setAttribute('data-theme', t);
    } catch (e) {}
  })();
`;

import { SearchModalProvider } from "@/components/search/SearchModalContext";
import { NotificationProvider } from "@/components/notification/NotificationProvider";
import { UserProvider } from "@/components/user/UserProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="bg-surface text-on-surface antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SearchModalProvider>
            <NotificationProvider>
              <UserProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </UserProvider>
            </NotificationProvider>
          </SearchModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
