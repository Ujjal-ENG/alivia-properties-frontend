import type { Project, ProjectStatus } from "@/types/project.types"
import { httpClient, type Paginated } from "./http-client"

export type ProjectQueryParams = {
  page?: number
  limit?: number
  status?: string
  featured?: boolean
  search?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  view?: string
}

const BASE = "/projects"

type BackendImage = { url: string; isCover?: boolean } | string
type BackendProject = Omit<Project, "galleryImages"> & {
  galleryImages?: BackendImage[]
  coverImageUrl?: string
  panorama?: { url: string } | null
}

function imgUrl(i: BackendImage): string {
  return typeof i === "string" ? i : i.url
}

// Derive the storage object key from a public URL (the backend ImageRef needs a
// `key`; the `url` is what the app renders).
function keyFromUrl(url: string): string {
  try {
    const segments = new URL(url).pathname.replace(/^\/+/, "").split("/")
    return segments.length > 1 ? segments.slice(1).join("/") : segments.join("/")
  } catch {
    return url
  }
}

// Map the admin form values to the backend write contract: uppercase status,
// gallery URLs → ordered ImageRef objects, blank optionals dropped.
function toWritePayload(payload: unknown): Record<string, unknown> {
  const { galleryImages, status, coverImageUrl, handoverDate, videoUrl, panorama, ...rest } =
    (payload ?? {}) as Record<string, unknown>
  const urls = Array.isArray(galleryImages) ? (galleryImages as string[]) : []
  // The form holds the panorama as a 0-or-1 entry URL array; the backend expects
  // a single ImageRef object (or null to clear it).
  const panoramaUrl = Array.isArray(panorama) ? (panorama as string[])[0] : undefined
  return {
    ...rest,
    ...(typeof status === "string" ? { status: status.toUpperCase() } : {}),
    ...(typeof coverImageUrl === "string"
      ? { coverImageUrl: coverImageUrl || undefined }
      : {}),
    ...(typeof videoUrl === "string" ? { videoUrl: videoUrl || undefined } : {}),
    ...(typeof handoverDate === "string"
      ? { handoverDate: handoverDate || undefined }
      : {}),
    galleryImages: urls.map((url, i) => ({
      key: keyFromUrl(url),
      url,
      isCover: i === 0,
      order: i,
    })),
    panorama: panoramaUrl ? { key: keyFromUrl(panoramaUrl), url: panoramaUrl } : null,
  }
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
    panoramaUrl: p.panorama?.url ?? undefined,
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
  // Fire-and-forget view ping. Scheduled by the detail page via Next.js
  // `after()`, so it runs after the response is sent (no public token needed).
  recordView(slug: string): Promise<{ success: boolean }> {
    return httpClient.post<{ success: boolean }>(`${BASE}/${slug}/view`)
  },
  async byId(id: string, token?: string): Promise<Project> {
    const p = await httpClient.get<BackendProject>(`${BASE}/id/${id}`, { token })
    return toFrontendProject(p)
  },
  create(payload: unknown, token?: string): Promise<Project> {
    return httpClient
      .post<BackendProject>(BASE, toWritePayload(payload), { token })
      .then(toFrontendProject)
  },
  update(id: string, payload: unknown, token?: string): Promise<Project> {
    return httpClient
      .patch<BackendProject>(`${BASE}/${id}`, toWritePayload(payload), { token })
      .then(toFrontendProject)
  },
  remove(id: string, token?: string): Promise<{ success: boolean }> {
    return httpClient.delete<{ success: boolean }>(`${BASE}/${id}`, { token })
  },
  setStatus(id: string, status: ProjectStatus, token?: string): Promise<Project> {
    return httpClient
      .patch<BackendProject>(`${BASE}/${id}/status`, { status: status.toUpperCase() }, { token })
      .then(toFrontendProject)
  },
  setFeatured(id: string, isFeatured: boolean, token?: string): Promise<Project> {
    return httpClient
      .patch<BackendProject>(`${BASE}/${id}/feature`, { isFeatured }, { token })
      .then(toFrontendProject)
  },
}

export const getProjects = projectsService.list
export const getProjectBySlug = projectsService.bySlug
export const recordProjectView = projectsService.recordView
export const getProjectById = projectsService.byId
export const createProject = projectsService.create
export const updateProject = projectsService.update
export const deleteProject = projectsService.remove

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
