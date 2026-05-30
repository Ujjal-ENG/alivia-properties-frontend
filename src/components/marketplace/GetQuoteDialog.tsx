"use client"

import * as React from "react"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GetQuoteForm, type QuoteContext } from "./GetQuoteForm"

type Props = {
  context?: QuoteContext
  trigger?: React.ReactNode
  triggerLabel?: string
  triggerVariant?: React.ComponentProps<typeof Button>["variant"]
  triggerSize?: React.ComponentProps<typeof Button>["size"]
  triggerClassName?: string
}

export function GetQuoteDialog({
  context,
  trigger,
  triggerLabel = "Get a Quote",
  triggerVariant = "default",
  triggerSize = "sm",
  triggerClassName,
}: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button
              variant={triggerVariant}
              size={triggerSize}
              className={triggerClassName}
            />
          )
        }
      >
        {!trigger && (
          <>
            <FileText className="size-4" />
            {triggerLabel}
          </>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        // Don't close while submitting — handled inside the form
      >
        <DialogHeader>
          <DialogTitle>
            {context?.productName
              ? `Quote for ${context.productName}`
              : context?.supplierName
                ? `Quote from ${context.supplierName}`
                : context?.categoryName
                  ? `Quote — ${context.categoryName}`
                  : "Request a Quote"}
          </DialogTitle>
          <DialogDescription>
            Tell the supplier what you need. They typically respond within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <GetQuoteForm
          context={context}
          onSuccess={() => {
            // Keep dialog open to show success state
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
