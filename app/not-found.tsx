'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Home, Search, ArrowRight, Heart, Users, Globe } from "lucide-react";

/**
 * Not Found page - displayed when a route is not found
 */
export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");

  const popularLinks = [
    { href: "/explore", label: "Browse Projects", icon: Search, description: "Find projects to support" },
    { href: "/about", label: "About Us", icon: Users, description: "Learn about our mission" },
    { href: "/dashboard", label: "Dashboard", icon: Heart, description: "Manage your donations" },
    { href: "/privacy", label: "Privacy Policy", icon: Globe, description: "Our privacy commitments" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to explore page with search query
      window.location.href = `/explore?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Illustration */}
        <div className="relative mb-8">
          <div className="mx-auto w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Search className="w-16 h-16 text-primary" />
          </div>
          {/* Floating elements for visual interest */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-secondary/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-accent/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        </div>

        {/* Error Title */}
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Oops! Page Not Found
        </h2>

        {/* Friendly Message */}
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for seems to have wandered off into the digital void.
          Don&apos;t worry, let&apos;s get you back on track!
        </p>

        {/* Search Functionality */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="px-4">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Popular Links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Popular Pages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {popularLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button
              size="lg"
              className="inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Go Back
          </Button>
        </div>

        {/* Fun Quote */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground italic">
            &quot;Not all those who wander are lost.&quot; - J.R.R. Tolkien
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            But in this case, you definitely took a wrong turn! 😊
          </p>
        </div>
      </div>
    </div>
  );
}
