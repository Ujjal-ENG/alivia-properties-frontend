"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Eye, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES } from "@/config/routes.config"
import { blogService, type BlogPost, type BlogPostInput } from "@/services/blog.service"
import { ApiError } from "@/services/http-client"

type AdminBlogEditorFormProps = {
  post?: BlogPost
  token?: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function toDateTimeLocal(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export function AdminBlogEditorForm({ post, token }: AdminBlogEditorFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug))
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "")
  const [author, setAuthor] = useState(typeof post?.author === "string" ? post.author : post?.author?.name ?? "Alivia Editorial Team")
  const [authorAvatar, setAuthorAvatar] = useState(post?.authorAvatar ?? "")
  const [category, setCategory] = useState(post?.category ?? "")
  const [tags, setTags] = useState(post?.tags?.join(", ") ?? "")
  const [readMinutes, setReadMinutes] = useState(String(post?.readMinutes ?? post?.readTime ?? 5))
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false)
  const [publishedAt, setPublishedAt] = useState(toDateTimeLocal(post?.publishedAt))
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [error, setError] = useState<string | null>(null)

  function updateTitle(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function payload(nextPublished: boolean): BlogPostInput {
    return {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || null,
      author: author.trim(),
      authorAvatar: authorAvatar.trim() || null,
      category: category.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      readMinutes: Math.max(1, Number(readMinutes) || 5),
      isPublished: nextPublished,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
    }
  }

  async function save(nextPublished: boolean) {
    setSaving(nextPublished ? "publish" : "draft")
    setError(null)

    try {
      const body = payload(nextPublished)
      const saved = post
        ? await blogService.update(post.id, body, token)
        : await blogService.create(body, token)

      router.push(ROUTES.ADMIN_BLOG_EDIT(saved.id))
      router.refresh()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save this article.",
      )
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-5">
      <Link
        href={ROUTES.ADMIN_BLOG}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="surface-card space-y-5 p-5">
          <div>
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(event) => updateTitle(event.target.value)}
              placeholder="Dhaka property market outlook"
              className="mt-2 h-11"
            />
          </div>

          <div>
            <Label htmlFor="blog-slug">Slug</Label>
            <Input
              id="blog-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true)
                setSlug(slugify(event.target.value))
              }}
              placeholder="dhaka-property-market-outlook"
              className="mt-2 h-11"
            />
          </div>

          <div>
            <Label htmlFor="blog-excerpt">Excerpt</Label>
            <Textarea
              id="blog-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="Short summary for cards and SEO previews."
              className="mt-2 min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="blog-content">Content</Label>
            <Textarea
              id="blog-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={"Write the article body. Use ## headings and - bullet lines if needed."}
              className="mt-2 min-h-[420px] font-mono text-sm leading-6"
            />
          </div>
        </section>

        <aside className="space-y-5">
          <div className="surface-card space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                Publishing
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Save privately as a draft or publish live to the public blog.
              </p>
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-border bg-ink-50 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
              />
              Published
            </label>

            <div>
              <Label htmlFor="blog-published-at">Published at</Label>
              <Input
                id="blog-published-at"
                type="datetime-local"
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
                className="mt-2 h-11"
              />
            </div>

            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={saving !== null}
                onClick={() => save(false)}
              >
                {saving === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save draft
              </Button>
              <Button
                type="button"
                className="rounded-full"
                disabled={saving !== null}
                onClick={() => save(true)}
              >
                {saving === "publish" ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
                Publish
              </Button>
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          </div>

          <div className="surface-card space-y-4 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              Article details
            </p>

            <div>
              <Label htmlFor="blog-category">Category</Label>
              <Input
                id="blog-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Market Updates"
                className="mt-2 h-11"
              />
            </div>

            <div>
              <Label htmlFor="blog-author">Author</Label>
              <Input
                id="blog-author"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className="mt-2 h-11"
              />
            </div>

            <div>
              <Label htmlFor="blog-author-avatar">Author avatar URL</Label>
              <Input
                id="blog-author-avatar"
                value={authorAvatar}
                onChange={(event) => setAuthorAvatar(event.target.value)}
                placeholder="https://..."
                className="mt-2 h-11"
              />
            </div>

            <div>
              <Label htmlFor="blog-cover">Cover image URL</Label>
              <Input
                id="blog-cover"
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                placeholder="https://..."
                className="mt-2 h-11"
              />
            </div>

            <div>
              <Label htmlFor="blog-tags">Tags</Label>
              <Input
                id="blog-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="dhaka, investment, rajuk"
                className="mt-2 h-11"
              />
            </div>

            <div>
              <Label htmlFor="blog-read-minutes">Read minutes</Label>
              <Input
                id="blog-read-minutes"
                type="number"
                min={1}
                value={readMinutes}
                onChange={(event) => setReadMinutes(event.target.value)}
                className="mt-2 h-11"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
