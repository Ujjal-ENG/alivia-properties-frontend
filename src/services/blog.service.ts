import { httpClient, type Paginated } from "./http-client"

export type BlogAuthor = { name: string; avatar?: string | null; title?: string }

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content?: string
  coverImage?: string | null
  author: string | BlogAuthor
  authorAvatar?: string | null
  category: string
  tags?: string[]
  readMinutes?: number
  readTime?: number
  isPublished: boolean
  viewCount?: number
  publishedAt: string
  createdAt?: string
  updatedAt?: string
}

export type BlogPostInput = {
  title: string
  slug?: string
  excerpt: string
  content: string
  coverImage?: string | null
  author: string
  authorAvatar?: string | null
  category: string
  tags?: string[]
  readMinutes?: number
  isPublished?: boolean
  publishedAt?: string
}

const BASE = "/blog"

export const blogService = {
  list(
    params: { page?: number; limit?: number; category?: string; search?: string } = {},
  ): Promise<Paginated<BlogPost>> {
    return httpClient.paginated<BlogPost>(BASE, {
      query: params as Record<string, string | number | undefined>,
    })
  },
  bySlug(slug: string): Promise<BlogPost> {
    return httpClient.get<BlogPost>(`${BASE}/${slug}`)
  },
  adminList(
    params: { page?: number; limit?: number; category?: string; search?: string; status?: string } = {},
    token?: string,
  ): Promise<Paginated<BlogPost>> {
    return httpClient.paginated<BlogPost>(`${BASE}/admin`, {
      query: params as Record<string, string | number | undefined>,
      token,
      cache: "no-store",
    })
  },
  adminDetail(id: string, token?: string): Promise<BlogPost> {
    return httpClient.get<BlogPost>(`${BASE}/admin/${id}`, {
      token,
      cache: "no-store",
    })
  },
  create(payload: BlogPostInput, token?: string): Promise<BlogPost> {
    return httpClient.post<BlogPost>(BASE, payload, { token })
  },
  update(id: string, payload: Partial<BlogPostInput>, token?: string): Promise<BlogPost> {
    return httpClient.patch<BlogPost>(`${BASE}/${id}`, payload, { token })
  },
  remove(id: string, token?: string): Promise<BlogPost> {
    return httpClient.delete<BlogPost>(`${BASE}/${id}`, { token })
  },
}

export const getBlogPosts = blogService.list
export const getBlogPostBySlug = blogService.bySlug
