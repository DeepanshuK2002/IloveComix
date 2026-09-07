export default function MangadexNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-6xl font-extrabold gradient-text mb-4">404</h1>
      <p className="text-text-secondary text-lg mb-6">
        This manga could not be found
      </p>
      <a
        href="/browse"
        className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-semibold text-white hover:bg-accent-secondary transition-all"
      >
        Browse Manga
      </a>
    </div>
  );
}
