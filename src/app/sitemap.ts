import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { siteRoutes } from "@/config/routes";

/**
 * Generates the sitemap for search engines.
 * Lists all internal (non-external) routes from the shared route table
 * with absolute URLs derived from the configured canonical site URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  return siteRoutes
    .filter((route) => !route.external)
    .map((route) => ({
      url: `${base}${route.href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route.href === "/" ? 1 : 0.8,
    }));
}
