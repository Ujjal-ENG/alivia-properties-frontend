import Link from "next/link"
import Image from "next/image"
import { Clock, ArrowRight } from "lucide-react"
import { DUMMY_BLOG_POSTS, BLOG_CATEGORIES } from "@/data/dummy-blog-posts"
import { SectionHeader } from "@/components/common/section-header"
import { ROUTES } from "@/config/routes.config"

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams
  const posts = category
    ? DUMMY_BLOG_POSTS.filter((p) => p.category === category)
    : DUMMY_BLOG_POSTS

  return (
    <div className="section-y">
      <div className="container-page">
        <SectionHeader
          eyebrow="Our Blog"
          title="Real Estate Insights"
          subtitle="Expert tips, market analysis, and buying guides for the Bangladesh property market."
          align="left"
        />

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mt-8 mb-10">
          <Link
            href={ROUTES.BLOG}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !category ? "bg-brand-600 text-white border-brand-600" : "border-border hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            All
          </Link>
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`${ROUTES.BLOG}?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === cat ? "bg-brand-600 text-white border-brand-600" : "border-border hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-card transition-shadow">
              <Link href={ROUTES.BLOG_POST(post.slug)} className="block relative h-48 overflow-hidden bg-muted">
                <Image src={post.coverImage} alt={post.title} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-600 text-white">{post.category}</span>
                </div>
              </Link>
              <div className="p-5 space-y-3">
                <Link href={ROUTES.BLOG_POST(post.slug)}>
                  <h2 className="text-sm font-bold line-clamp-2 hover:text-brand-700 transition-colors leading-snug">{post.title}</h2>
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                  <span>{post.author.name}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime} min read</span>
                </div>
                <Link href={ROUTES.BLOG_POST(post.slug)} className="inline-flex items-center gap-1 text-xs text-brand-700 font-semibold hover:underline">
                  Read More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
