'use client';

import React, { useState } from "react";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email address is required.";
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address.";
  return null;
}

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { message?: string }).message ?? "Subscription failed. Please try again."
        );
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-primary"
      aria-labelledby="newsletter-heading"
    >
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="w-10 h-10 text-primary-foreground/80 mx-auto mb-4" aria-hidden="true" />
        <h2
          id="newsletter-heading"
          className="text-3xl font-extrabold text-primary-foreground"
        >
          Stay in the loop
        </h2>
        <p className="mt-3 text-primary-foreground/80 text-sm">
          Get updates on new campaigns, impact stories, and platform news.
        </p>

        {status === "success" ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-8 flex items-center justify-center gap-2 text-primary-foreground font-semibold"
          >
            <CheckCircle className="w-5 h-5" />
            Thanks for subscribing! Check your inbox to confirm.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8"
            aria-describedby={error ? "newsletter-error" : undefined}
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="flex-1 max-w-sm">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  aria-invalid={!!error}
                  aria-describedby={error ? "newsletter-error" : undefined}
                  disabled={status === "loading"}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-primary-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 disabled:opacity-60 ${
                    error ? "ring-2 ring-red-400" : ""
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-2.5 rounded-lg bg-primary-foreground text-primary text-sm font-semibold hover:bg-primary-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-w-[110px]"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing…
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p
                id="newsletter-error"
                role="alert"
                className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-200"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </form>
        )}

        <p className="mt-4 text-xs text-primary-foreground/60">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
