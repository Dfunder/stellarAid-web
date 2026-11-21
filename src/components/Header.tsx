import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Application header shell.
 *
 * Server component that renders the brand, the primary navigation from the
 * shared route table, and a slot for the wallet button. Responsive at 320px
 * without horizontal scrolling.
 */
export function Header() {
  return (
    <header className="border-b border-foreground/10 bg-background">
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-6 py-4"
      >
        <a
          href="/"
          className="text-base font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          aria-label={`${siteConfig.name} home`}
        >
          {siteConfig.name}
        </a>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {siteConfig.links.navigation.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-sm text-foreground/70 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <ThemeToggle />
      </nav>
    </header>
  );
}
