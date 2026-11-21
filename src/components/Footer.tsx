import Link from "next/link";
import { siteRoutes } from "../config/routes";

export function Footer() {
  return (
    <footer className="border-t border-foreground/10 px-6 py-8 text-sm text-foreground/70">
      <nav aria-label="Footer">
        <ul className="mx-auto flex max-w-5xl flex-wrap items-center gap-5">
          {siteRoutes.map((route) => (
            <li key={route.href}>
              {route.external ? (
                <a
                  href={route.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {route.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  href={route.href}
                  className="rounded-sm transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {route.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
