import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Explore Projects",
  description: "Browse and discover verified aid projects from around the world. Find causes that matter to you and make a difference with transparent donations.",
  openGraph: {
    title: "Explore Projects | StellarAid",
    description: "Browse and discover verified aid projects from around the world. Find causes that matter to you and make a difference with transparent donations.",
    url: "/explore",
  },
  twitter: {
    title: "Explore Projects | StellarAid",
    description: "Browse and discover verified aid projects from around the world. Find causes that matter to you and make a difference with transparent donations.",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}