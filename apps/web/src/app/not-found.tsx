export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-8xl font-extrabold gradient-text mb-4">404</h1>
      <p className="text-text-secondary text-xl mb-2">
        Page not found
      </p>
      <p className="text-text-muted mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-semibold text-white hover:bg-accent-secondary transition-all"
      >
        Go Home
      </a>
    </div>
  );
}
