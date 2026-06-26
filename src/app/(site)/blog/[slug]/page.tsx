export const dynamic = "force-dynamic"

import { after } from "next/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Clock, ChevronRight, Calendar } from "lucide-react"
import { blogService, recordArticleView } from "@/services/blog.service"
import { ROUTES } from "@/config/routes.config"

const FALLBACK_BLOG_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await blogService.bySlug(slug).catch(() => null)
  if (!post) notFound()

  // Defer the view-count write until after the article HTML is sent, so reading
  // the post is never blocked by the analytics update. Errors are ignored.
  after(() => {
    void recordArticleView(slug).catch(() => {})
  })

  const relatedRes = await blogService.list({ category: post.category, limit: 4 }).catch(() => ({
    data: [],
    meta: { page: 1, limit: 4, total: 0, totalPages: 0 },
  }))
  const related = relatedRes.data.filter((item) => item.id !== post.id).slice(0, 3)

  const authorObj =
    typeof post.author === "string"
      ? { name: post.author, avatar: post.authorAvatar ?? null, title: "" }
      : post.author
  const paragraphs = (post.content ?? "").split("\n\n").filter(Boolean)

  return (
    <div className="section-y">
      <div className="container-page max-w-4xl">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={ROUTES.HOME} className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={ROUTES.BLOG} className="hover:text-foreground">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 font-medium text-foreground">{post.title}</span>
        </nav>

        <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-700">
          {post.category}
        </span>

        <h1 className="mb-4 text-h1">{post.title}</h1>

        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {authorObj.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={authorObj.avatar} alt={authorObj.name} className="h-8 w-8 rounded-full object-cover" />
            )}
            <div>
              <p className="text-xs font-medium text-foreground">{authorObj.name}</p>
              {"title" in authorObj ? <p className="text-xs">{authorObj.title}</p> : null}
            </div>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.publishedAt).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime ?? post.readMinutes ?? 5} min read
          </span>
        </div>

        <div className="relative mb-8 h-64 overflow-hidden rounded-2xl md:h-96">
          <Image src={post.coverImage || FALLBACK_BLOG_IMAGE} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
        </div>

        <article className="prose prose-sm max-w-none space-y-4">
          {paragraphs.map((para, index) => {
            if (para.startsWith("## ")) {
              return <h2 key={index} className="mb-2 mt-8 text-h3">{para.slice(3)}</h2>
            }
            if (para.startsWith("### ")) {
              return <h3 key={index} className="mb-1 mt-6 text-base font-bold">{para.slice(4)}</h3>
            }
            if (para.startsWith("- ")) {
              const items = para.split("\n").filter((line) => line.startsWith("- "))
              return (
                <ul key={index} className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {items.map((item, itemIndex) => <li key={itemIndex}>{item.slice(2)}</li>)}
                </ul>
              )
            }
            return <p key={index} className="text-sm leading-relaxed text-muted-foreground">{para}</p>
          })}
        </article>

        {related.length > 0 && (
          <div className="mt-16 border-t border-border pt-8">
            <h3 className="mb-6 text-h3">Related Articles</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={ROUTES.BLOG_POST(item.slug)} className="group block overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-card">
                  <div className="relative h-32 overflow-hidden bg-muted">
                    <Image src={item.coverImage || FALLBACK_BLOG_IMAGE} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-xs font-bold transition-colors group-hover:text-brand-700">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.readTime ?? item.readMinutes ?? 5} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
