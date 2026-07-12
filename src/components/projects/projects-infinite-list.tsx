"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ProjectCard } from "@/components/projects/project-card"
import { projectsService, type ProjectQueryParams } from "@/services/projects.service"
import type { Project } from "@/types/project.types"

const LIMIT = 12

interface ProjectsInfiniteListProps {
  initialProjects: Project[]
  initialPage: number
  totalPages: number
  filters: Omit<ProjectQueryParams, "page" | "limit">
}

export function ProjectsInfiniteList({
  initialProjects,
  initialPage,
  totalPages,
  filters,
}: ProjectsInfiniteListProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(initialPage < totalPages)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false) // guards the async gap so the observer can't double-fire

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)
    try {
      const res = await projectsService.list({
        ...filters,
        page: page + 1,
        limit: LIMIT,
      })
      setProjects((prev) => [...prev, ...res.data])
      setPage(res.meta.page)
      setHasMore(res.meta.page < res.meta.totalPages)
    } catch {
      setHasMore(false) // ponytail: stop the loop on error instead of retrying forever
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [page, hasMore, filters])

  // Load the next page whenever the sentinel nears the viewport (400px early).
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: "400px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore, hasMore])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {hasMore ? (
        <div
          ref={sentinelRef}
          className="flex justify-center py-10 text-sm text-muted-foreground"
        >
          {loading ? "Loading more projects…" : null}
        </div>
      ) : null}
    </>
  )
}
