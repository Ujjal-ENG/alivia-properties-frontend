"use client"

import { useState } from "react"
import { AlertCircle, Loader2, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/services/http-client"
import { marketplaceService, type MarketplaceCategory } from "@/services/marketplace.service"

type Props = {
  cat: MarketplaceCategory | null
  onClose: () => void
  onDeleted: (slug: string) => void
}

export function DeleteDialog({ cat, onClose, onDeleted }: Props) {
  const { data: session } = useSession()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isGroup = !cat?.parentSlug

  async function confirm() {
    if (!cat || !session?.accessToken) return
    setDeleting(true)
    setError(null)
    try {
      await marketplaceService.adminDeleteCategory(cat.slug, session.accessToken)
      onDeleted(cat.slug)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed")
      setDeleting(false)
    }
  }

  return (
    <Dialog open={Boolean(cat)} onOpenChange={(v) => { if (!v && !deleting) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {isGroup ? "group" : "sub-category"}</DialogTitle>
          <DialogDescription>
            {isGroup ? (
              <>
                This will permanently remove the group <strong>{cat?.name}</strong>.
                Groups with sub-categories cannot be deleted — remove all sub-categories first.
              </>
            ) : (
              <>
                This will permanently remove <strong>{cat?.name}</strong>.
                Categories with products cannot be deleted.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={deleting} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={deleting} onClick={confirm}>
            {deleting
              ? <><Loader2 className="size-4 animate-spin" /> Deleting…</>
              : <><Trash2 className="size-4" /> Delete</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
