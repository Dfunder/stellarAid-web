import React from "react";
import Link from "next/link";
import { Twitter, Github, Disc } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-base leading-none">S</span>
              </div>
              <span className="text-lg font-semibold text-foreground">StellarAid</span>
            </div>
            <p className="text-sm text-muted-foreground">Transparent charitable giving on blockchain</p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-foreground">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                  <Twitter className="w-4 h-4" /> Twitter
                </Link>
              </li>
              <li>
                <Link href="https://discord.com" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                  <Disc className="w-4 h-4" /> Discord
                </Link>
              </li>
              <li>
                <Link href="https://github.com" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                  <Github className="w-4 h-4" /> GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          © 2026 StellarAid. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;