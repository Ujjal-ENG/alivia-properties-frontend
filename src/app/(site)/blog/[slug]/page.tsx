import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Clock, ChevronRight, Calendar } from "lucide-react"
import { DUMMY_BLOG_POSTS } from "@/data/dummy-blog-posts"
import { ROUTES } from "@/config/routes.config"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = DUMMY_BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) notFound()

  const related = DUMMY_BLOG_POSTS
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3)

  const paragraphs = post.content.split("\n\n").filter(Boolean)

  return (
    <div className="section-y">
      <div className="container-page max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href={ROUTES.HOME} className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={ROUTES.BLOG} className="hover:text-foreground">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
        </nav>

        {/* Category */}
        <span className="inline-block text-xs font-semibold px-3 py-0.5 rounded-full bg-brand-100 text-brand-700 mb-4">
          {post.category}
        </span>

        <h1 className="text-h1 mb-4">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.author.avatar} alt={post.author.name} className="h-8 w-8 rounded-full object-cover" />
            <div>
              <p className="font-medium text-foreground text-xs">{post.author.name}</p>
              <p className="text-xs">{post.author.title}</p>
            </div>
          </div>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(post.publishedAt).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime} min read</span>
        </div>

        {/* Cover */}
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>

        {/* Content */}
        <article className="prose prose-sm max-w-none space-y-4">
          {paragraphs.map((para, i) => {
            if (para.startsWith("## ")) {
              return <h2 key={i} className="text-h3 mt-8 mb-2">{para.slice(3)}</h2>
            }
            if (para.startsWith("### ")) {
              return <h3 key={i} className="text-base font-bold mt-6 mb-1">{para.slice(4)}</h3>
            }
            if (para.startsWith("- ")) {
              const items = para.split("\n").filter((l) => l.startsWith("- "))
              return (
                <ul key={i} className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {items.map((item, j) => <li key={j}>{item.slice(2)}</li>)}
                </ul>
              )
            }
            return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
          })}
        </article>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border">
            <h3 className="text-h3 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link key={r.id} href={ROUTES.BLOG_POST(r.slug)} className="group block bg-white rounded-xl border border-border overflow-hidden hover:shadow-card transition-shadow">
                  <div className="relative h-32 overflow-hidden bg-muted">
                    <Image src={r.coverImage} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold line-clamp-2 group-hover:text-brand-700 transition-colors">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.readTime} min read</p>
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
