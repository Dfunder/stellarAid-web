import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Generates the robots.txt rules.
 *
 * The canonical URL is read from the shared site config (never hardcoded).
 * When the deployment URL does not match the canonical URL (staging, preview,
 * localhost) all routes are disallowed to prevent indexing of non-production builds.
 */
function isCanonicalDeployment(): boolean {
  const deploymentUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!deploymentUrl) return false;

  try {
    const canonical = new URL(siteConfig.url).hostname.replace(/^www\./, "");
    const current = new URL(
      deploymentUrl.startsWith("http") ? deploymentUrl : `https://${deploymentUrl}`,
    ).hostname.replace(/^www\./, "");

    return canonical === current;
  } catch {
    return false;
  }
}

export default function robots(): MetadataRoute.Robots {
  const allowAll = isCanonicalDeployment();

  return {
    rules: {
      userAgent: "*",
      allow: allowAll ? "/" : undefined,
      disallow: allowAll ? undefined : "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
