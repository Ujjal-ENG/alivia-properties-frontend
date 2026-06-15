"use client";

import {
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/services/http-client";
import { inquiriesService } from "@/services/inquiries.service";

type SellerInquiryFormProps = {
  propertyId: string;
  propertyTitle: string;
  sellerName: string;
};

const QUICK_PROMPTS = [
  "I'd like to schedule a visit.",
  "Is the price negotiable?",
  "Can you share more photos?",
  "Is this still available?",
];

export function SellerInquiryForm({
  propertyId,
  propertyTitle,
  sellerName,
}: SellerInquiryFormProps) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Capture the form node synchronously: after the `await` below, React has
    // finished dispatching the event and resets `event.currentTarget` to null.
    const form = event.currentTarget;
    setSubmitting(true);
    setSubmitted(false);
    setError(null);

    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const messageValue = String(formData.get("message") ?? "").trim();

    try {
      await inquiriesService.create(
        {
          type: "PROPERTY",
          propertyId,
          name,
          email,
          phone,
          message: messageValue,
        },
        session?.accessToken,
      );
      form.reset();
      setMessage("");
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not send this inquiry right now.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function applyPrompt(prompt: string) {
    setMessage((prev) =>
      prev.includes(prompt) ? prev : prev ? `${prev} ${prompt}` : prompt,
    );
  }

  if (submitted) {
    return (
      <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/80 p-5 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-emerald-900">
          Inquiry sent to {sellerName}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-700">
          They&apos;ve received your message about {propertyTitle} and will get
          back to you soon.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSubmitted(false)}
          className="mt-4 h-9 rounded-full border-emerald-300 bg-white/70 text-emerald-800 hover:bg-white"
        >
          Send another inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-ink-500">Quick start</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => applyPrompt(prompt)}
              className="rounded-full border border-brand-200 bg-brand-50/70 px-2.5 py-1 text-xs font-medium text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-100"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="inq-name"
            className="text-xs font-medium text-ink-600"
          >
            Your name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input
              id="inq-name"
              name="name"
              required
              autoComplete="name"
              defaultValue={session?.user?.name ?? ""}
              placeholder="e.g. Rahim Ahmed"
              className="h-11 pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="inq-phone"
            className="text-xs font-medium text-ink-600"
          >
            Phone number
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input
              id="inq-phone"
              name="phone"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              className="h-11 pl-9"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="inq-email" className="text-xs font-medium text-ink-600">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            id="inq-email"
            name="email"
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={session?.user?.email ?? ""}
            placeholder="you@example.com"
            className="h-11 pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="inq-message"
          className="text-xs font-medium text-ink-600"
        >
          Message
        </label>
        <Textarea
          id="inq-message"
          name="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your budget, visit timing, or any question about this listing..."
          className="resize-none"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className="h-11 w-full rounded-full bg-brand-700 text-white shadow-sm transition-colors hover:bg-brand-800"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Send inquiry
          </>
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-ink-400">
        <ShieldCheck className="size-3.5 text-brand-500" />
        Your details are shared only with {sellerName}.
      </p>
    </form>
  );
}
