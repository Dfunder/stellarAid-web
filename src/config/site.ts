export type SiteLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  links: {
    navigation: SiteLink[];
    footer: SiteLink[];
  };
};

export const siteConfig = {
  name: "StellarAid",
  tagline: "Blockchain-powered crowdfunding for global impact",
  description:
    "StellarAid is a blockchain-powered crowdfunding platform on Stellar, enabling transparent, verifiable on-chain donations for global impact.",
  url: "https://stellaraid.vercel.app",
  links: {
    navigation: [
      { label: "Home", href: "/" },
      {
        label: "GitHub",
        href: "https://github.com/Dfunder/stellarAid-web",
        external: true,
      },
    ],
    footer: [
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
    ],
  },
} satisfies SiteConfig;
