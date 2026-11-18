export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center text-foreground">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-foreground/80">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="/"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Return home
        </a>
        <a
          href="https://github.com/Dfunder/stellarAid-web"
          rel="noreferrer"
          className="rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          Project repository
        </a>
      </div>
    </main>
  );
}
