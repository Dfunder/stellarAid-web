import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center text-foreground">
      <p className="text-sm font-medium uppercase tracking-wide text-foreground/70">
        {siteConfig.name}
      </p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-foreground/80">
        The page you are looking for does not exist or has moved.
      </p>
      <nav aria-label="Recovery links">
        <ul className="flex flex-wrap items-center justify-center gap-4">
          {siteConfig.links.navigation.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
