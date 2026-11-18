export type SiteRoute = {
  label: string;
  href: string;
  external?: boolean;
};

export const siteRoutes: SiteRoute[] = [
  { label: "Home", href: "/" },
  {
    label: "GitHub",
    href: "https://github.com/Dfunder/stellarAid-web",
    external: true,
  },
  {
    label: "Documentation",
    href: "https://github.com/Dfunder/stellarAid-web#readme",
    external: true,
  },
  {
    label: "Report an issue",
    href: "https://github.com/Dfunder/stellarAid-web/issues",
    external: true,
  },
];
