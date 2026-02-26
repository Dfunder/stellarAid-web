import React from "react";
import Link from "next/link";
import { Twitter, GitHub, Discord } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#1a3a6b] flex items-center justify-center">
                <span className="text-white font-bold text-base leading-none">S</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">StellarAid</span>
            </div>
            <p className="text-sm text-gray-500">Transparent charitable giving on blockchain</p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="text-gray-500 hover:text-gray-900">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-500 hover:text-gray-900">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-500 hover:text-gray-900">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-gray-900">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-gray-900">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-gray-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <Link href="https://twitter.com" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2">
                  <Twitter className="w-4 h-4" /> Twitter
                </Link>
              </li>
              <li>
                <Link href="https://discord.com" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2">
                  <Discord className="w-4 h-4" /> Discord
                </Link>
              </li>
              <li>
                <Link href="https://github.com" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2">
                  <GitHub className="w-4 h-4" /> GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © 2026 StellarAid. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;