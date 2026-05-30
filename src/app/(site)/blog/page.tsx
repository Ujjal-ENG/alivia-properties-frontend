export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { Clock, ArrowRight } from "lucide-react"
import { SectionHeader } from "@/components/common/section-header"
import { ROUTES } from "@/config/routes.config"
import { blogService } from "@/services/blog.service"

const FALLBACK_BLOG_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams
  const postsRes = await blogService.list({ category, limit: 24 }).catch(() => ({
    data: [],
    meta: { page: 1, limit: 24, total: 0, totalPages: 0 },
  }))
  const allPostsRes = await blogService.list({ limit: 50 }).catch(() => ({
    data: [],
    meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
  }))

  const posts = postsRes.data
  const categories = Array.from(new Set(allPostsRes.data.map((post) => post.category))).sort()

  return (
    <div className="section-y">
      <div className="container-page">
        <SectionHeader
          eyebrow="Our Blog"
          title="Real Estate Insights"
          subtitle="Expert tips, market analysis, and buying guides for the Bangladesh property market."
          align="left"
        />

        <div className="mb-10 mt-8 flex flex-wrap gap-2">
          <Link
            href={ROUTES.BLOG}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !category ? "border-brand-600 bg-brand-600 text-white" : "border-border hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item}
              href={`${ROUTES.BLOG}?category=${encodeURIComponent(item)}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === item ? "border-brand-600 bg-brand-600 text-white" : "border-border hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-card">
              <Link href={ROUTES.BLOG_POST(post.slug)} className="relative block h-48 overflow-hidden bg-muted">
                <Image
                  src={post.coverImage || FALLBACK_BLOG_IMAGE}
                  alt={post.title}
                  fill
                  sizes="33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">{post.category}</span>
                </div>
              </Link>
              <div className="space-y-3 p-5">
                <Link href={ROUTES.BLOG_POST(post.slug)}>
                  <h2 className="line-clamp-2 text-sm font-bold leading-snug transition-colors hover:text-brand-700">{post.title}</h2>
                </Link>
                <p className="line-clamp-2 text-xs text-muted-foreground">{post.excerpt}</p>
                <div className="border-t border-border pt-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>{typeof post.author === "string" ? post.author : post.author.name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime ?? post.readMinutes ?? 5} min read
                    </span>
                  </div>
                </div>
                <Link href={ROUTES.BLOG_POST(post.slug)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
                  Read More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-ink-500">
              No articles found for this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
