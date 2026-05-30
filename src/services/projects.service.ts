import type { Project, ProjectStatus } from "@/types/project.types"
import { httpClient, type Paginated } from "./http-client"

export type ProjectQueryParams = {
  page?: number
  limit?: number
  status?: string
  featured?: boolean
  search?: string
  sort?: string
}

const BASE = "/projects"

type BackendImage = { url: string; isCover?: boolean } | string
type BackendProject = Omit<Project, "galleryImages"> & {
  galleryImages?: BackendImage[]
  coverImageUrl?: string
}

function imgUrl(i: BackendImage): string {
  return typeof i === "string" ? i : i.url
}

function toFrontendProject(p: BackendProject): Project {
  const gallery = Array.isArray(p.galleryImages)
    ? p.galleryImages.map(imgUrl)
    : []
  const cover = p.coverImageUrl ?? gallery[0]
  return {
    ...p,
    galleryImages: gallery,
    coverImageUrl: cover,
    coverImage: cover,           // alias used by projects/[slug]/page.tsx
    featured: p.isFeatured,      // alias used by projects/[slug]/page.tsx
    area: p.area ?? p.location,
    division: p.division ?? "",
    status: (typeof p.status === "string"
      ? p.status.toLowerCase()
      : p.status) as ProjectStatus,
  }
}

export const projectsService = {
  async list(params: ProjectQueryParams = {}): Promise<Paginated<Project>> {
    const q = { ...params } as Record<string, string | number | boolean | undefined>
    if (typeof q.status === "string") q.status = q.status.toUpperCase()
    const res = await httpClient.paginated<BackendProject>(BASE, { query: q })
    return { ...res, data: res.data.map(toFrontendProject) }
  },
  async bySlug(slug: string): Promise<Project> {
    const p = await httpClient.get<BackendProject>(`${BASE}/${slug}`)
    return toFrontendProject(p)
  },
}

export const getProjects = projectsService.list
export const getProjectBySlug = projectsService.bySlug

export async function getProject(
  slug: string,
): Promise<{ success: true; data: Project } | { success: false; data: null }> {
  try {
    const data = await projectsService.bySlug(slug)
    return { success: true, data }
  } catch {
    return { success: false, data: null }
  }
}
