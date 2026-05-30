"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
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

export function SellerInquiryForm({
  propertyId,
  propertyTitle,
  sellerName,
}: SellerInquiryFormProps) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const message = String(formData.get("message") ?? "").trim();

    try {
      await inquiriesService.create(
        {
          type: "PROPERTY",
          propertyId,
          name,
          email,
          phone,
          message,
        },
        session?.accessToken,
      );
      form.reset();
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

  if (submitted) {
    return (
      <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="size-4" />
          Inquiry sent
        </p>
        <p className="mt-2 text-emerald-700">
          {sellerName} has received your message about {propertyTitle}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Input
          name="name"
          required
          defaultValue={session?.user?.name ?? ""}
          placeholder="Your name"
        />
        <Input name="phone" required type="tel" placeholder="Phone number" />
      </div>
      <Input
        name="email"
        required
        type="email"
        defaultValue={session?.user?.email ?? ""}
        placeholder="Email address"
      />
      <Textarea
        name="message"
        required
        rows={4}
        placeholder="Share your budget, visit timing, or any question about this listing..."
      />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-brand-700 text-white hover:bg-brand-800"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Send inquiry
      </Button>
    </form>
  );
}
