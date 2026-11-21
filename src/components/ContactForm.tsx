"use client";

import { useState } from "react";
import { useFormSubmission } from "../hooks/useFormSubmission";
import {
  HONEYPOT_FIELD_NAME,
  isHoneypotFilled,
  isValidEmail,
  sanitizeMessage,
} from "../lib/form-security";

export type ContactPayload = {
  email: string;
  message: string;
};

type ContactFormProps = {
  onSubmit?: (payload: ContactPayload) => void | Promise<void>;
};

type ContactErrors = {
  email?: string;
  message?: string;
};

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const { isSubmitting, submit } = useFormSubmission();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ContactErrors = {};
    if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (message.trim().length < 10) {
      nextErrors.message = "Message must be at least 10 characters.";
    }
    setErrors(nextErrors);
    setSubmitted(false);
    if (Object.keys(nextErrors).length > 0) return;

    await submit(async () => {
      if (!isHoneypotFilled(honeypot)) {
        await onSubmit?.({
          email: email.trim(),
          message: sanitizeMessage(message),
        });
      }
      setSubmitted(true);
      setEmail("");
      setMessage("");
      setHoneypot("");
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-email" className="font-medium">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className="rounded border px-3 py-2"
        />
        {errors.email ? (
          <p
            id="contact-email-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="rounded border px-3 py-2"
        />
        {errors.message ? (
          <p
            id="contact-message-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.message}
          </p>
        ) : null}
      </div>

      <div hidden>
        <label htmlFor="contact-honeypot">Company website</label>
        <input
          id="contact-honeypot"
          name={HONEYPOT_FIELD_NAME}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="self-start rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </button>

      {submitted ? (
        <p role="status" className="text-sm text-foreground/80">
          Thanks for reaching out. We will reply soon.
        </p>
      ) : null}
    </form>
  );
}
