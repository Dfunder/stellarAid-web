import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HONEYPOT_FIELD_NAME } from "../lib/form-security";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  it("shows accessible validation errors for invalid input", async () => {
    render(<ContactForm onSubmit={vi.fn()} />);
    const form = screen.getByRole("button", { name: /send message/i }).closest("form");
    if (!form) throw new Error("form not rendered");

    fireEvent.submit(form);

    expect(await screen.findByText(/valid email address/i)).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.getByText(/at least 10 characters/i)).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("sanitizes the message before submitting", async () => {
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "  user@example.com  " },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Hello <b>world</b> & friends" },
    });
    const form = screen.getByRole("button", { name: /send message/i }).closest("form");
    if (!form) throw new Error("form not rendered");

    fireEvent.submit(form);

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        email: "user@example.com",
        message: "Hello &lt;b&gt;world&lt;/b&gt; &amp; friends",
      }),
    );
  });

  it("blocks duplicate submissions while a submission is in flight", async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "A valid message from a human." },
    });
    const form = screen.getByRole("button", { name: /send message/i }).closest("form");
    if (!form) throw new Error("form not rendered");

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const button = screen.getByRole("button", { name: /sending/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      resolveSubmit?.();
    });
  });

  it("silently ignores submissions from a filled honeypot", async () => {
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    const honeypot = document.querySelector<HTMLInputElement>(
      `input[name="${HONEYPOT_FIELD_NAME}"]`,
    );
    if (!honeypot) throw new Error("honeypot not rendered");
    fireEvent.change(honeypot, { target: { value: "bot" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "A valid message from a human." },
    });
    const form = screen.getByRole("button", { name: /send message/i }).closest("form");
    if (!form) throw new Error("form not rendered");

    fireEvent.submit(form);

    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
