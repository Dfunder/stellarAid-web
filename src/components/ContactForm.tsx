"use client";

import { useState } from "react";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import {
  normalizeContactInput,
  validateContactInput,
  type ContactErrors,
  type ContactInput,
} from "@/lib/contact";

const initialForm: ContactInput = {
  name: "",
  email: "",
  message: "",
  company: "",
};

export function ContactForm() {
  const [form, setForm] = useState<ContactInput>(initialForm);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { isSubmitting, submit } = useFormSubmission();

  const update = (field: keyof ContactInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeContactInput(form);
    const nextErrors = validateContactInput(normalized);
    setErrors(nextErrors);
    setStatus("idle");

    if (Object.keys(nextErrors).length > 0) return;

    try {
      const ok = await submit(async () => {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalized),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { errors?: ContactErrors }
            | null;
          if (data?.errors) setErrors(data.errors);
          throw new Error("Contact submission failed");
        }
      });

      if (ok) {
        setForm(initialForm);
        setErrors({});
        setStatus("success");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-name" className="font-medium">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className="rounded border px-3 py-2"
        />
        {errors.name ? (
          <p id="contact-name-error" role="alert" className="text-sm text-red-600">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="contact-email" className="font-medium">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className="rounded border px-3 py-2"
        />
        {errors.email ? (
          <p id="contact-email-error" role="alert" className="text-sm text-red-600">
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
          rows={5}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="rounded border px-3 py-2"
        />
        {errors.message ? (
          <p id="contact-message-error" role="alert" className="text-sm text-red-600">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company ?? ""}
          onChange={(event) => update("company", event.target.value)}
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

      {status === "success" ? (
        <p role="status" className="text-sm text-green-700">
          Message sent.
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm text-red-600">
          Unable to send message. Please try again.
        </p>
      ) : null}
    </form>
  );
}
