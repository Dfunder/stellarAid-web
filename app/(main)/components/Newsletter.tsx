'use client';

import React, { useState } from "react";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="w-10 h-10 text-primary-foreground/80 mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold text-primary-foreground">
          Stay in the loop
        </h2>
        <p className="mt-3 text-primary-foreground/80 text-sm">
          Get updates on new campaigns, impact stories, and platform news.
        </p>
        {submitted ? (
          <p className="mt-8 text-primary-foreground font-semibold">
            ✓ Thanks for subscribing!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 max-w-sm px-4 py-2.5 rounded-lg text-sm bg-primary-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-primary-foreground text-primary text-sm font-semibold hover:bg-primary-foreground/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
        <p className="mt-4 text-xs text-primary-foreground/60">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
