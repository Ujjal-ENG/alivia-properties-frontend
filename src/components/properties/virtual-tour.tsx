"use client"

import Image from "next/image"
import {
  Compass,
  Loader2,
  Maximize,
  Minimize,
  MousePointer2,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

// Same-origin equirectangular panorama (4096×2048, power-of-two so we can use
// seamless horizontal REPEAT wrapping + mipmaps). Same-origin avoids the WebGL
// cross-origin "tainted texture" restriction. Pass `panoramaUrl` to override
// with a real per-listing 360° image once those are uploaded.
const DEMO_PANORAMA = "/demo/panorama-360.jpg"

const VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

// For each pixel we build a view ray from yaw/pitch/fov, then sample the
// equirectangular panorama at the matching longitude/latitude.
const FRAG_SRC = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPano;
uniform float uYaw;
uniform float uPitch;
uniform float uFov;
uniform float uAspect;
const float PI = 3.141592653589793;
void main() {
  float t = tan(uFov * 0.5);
  vec3 dir = normalize(vec3(vUv.x * uAspect * t, vUv.y * t, -1.0));
  float cp = cos(uPitch), sp = sin(uPitch);
  dir = vec3(dir.x, cp * dir.y - sp * dir.z, sp * dir.y + cp * dir.z);
  float cy = cos(uYaw), sy = sin(uYaw);
  dir = vec3(cy * dir.x + sy * dir.z, dir.y, -sy * dir.x + cy * dir.z);
  float lon = atan(dir.x, -dir.z);
  float lat = asin(clamp(dir.y, -1.0, 1.0));
  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);
  gl_FragColor = texture2D(uPano, uv);
}`

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error("Could not create shader")
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile failed")
  }
  return shader
}

export function VirtualTour({
  posterImage,
  panoramaUrl = DEMO_PANORAMA,
  title = "Virtual 360° Tour",
}: {
  posterImage?: string
  panoramaUrl?: string
  title?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [launched, setLaunched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }, [])

  useEffect(() => {
    if (!launched) return
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
    }) as WebGLRenderingContext | null
    if (!gl) {
      setError(true)
      return
    }

    let program: WebGLProgram | null = null
    try {
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
      program = gl.createProgram()
      if (!program) throw new Error("Could not create program")
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Program link failed")
      }
    } catch {
      setError(true)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(program, "aPos")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uYaw = gl.getUniformLocation(program, "uYaw")
    const uPitch = gl.getUniformLocation(program, "uPitch")
    const uFov = gl.getUniformLocation(program, "uFov")
    const uAspect = gl.getUniformLocation(program, "uAspect")
    gl.uniform1i(gl.getUniformLocation(program, "uPano"), 0)

    // Dark placeholder texture until the panorama finishes downloading.
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      1,
      1,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      new Uint8Array([18, 26, 24]),
    )

    let disposed = false
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (disposed) return
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.generateMipmap(gl.TEXTURE_2D)
      setLoading(false)
    }
    img.onerror = () => {
      if (disposed) return
      setError(true)
      setLoading(false)
    }
    img.src = panoramaUrl

    // View state
    let yaw = 0
    let pitch = 0
    let fov = 1.2 // ~69° vertical field of view
    let autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    // Drag to look around
    let dragging = false
    let lastX = 0
    let lastY = 0
    const onDown = (e: PointerEvent) => {
      dragging = true
      autoRotate = false
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const k = fov / canvas.clientHeight
      yaw -= (e.clientX - lastX) * k
      pitch -= (e.clientY - lastY) * k
      pitch = Math.max(-1.45, Math.min(1.45, pitch))
      lastX = e.clientX
      lastY = e.clientY
    }
    const onUp = (e: PointerEvent) => {
      dragging = false
      try {
        canvas.releasePointerCapture(e.pointerId)
      } catch {
        /* pointer already released */
      }
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      autoRotate = false
      fov = Math.max(0.5, Math.min(1.9, fov + e.deltaY * 0.0015))
    }
    // Pinch to zoom
    let pinchDist = 0
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const d = Math.hypot(dx, dy)
      if (pinchDist) {
        fov = Math.max(0.5, Math.min(1.9, fov - (d - pinchDist) * 0.003))
      }
      pinchDist = d
      autoRotate = false
      e.preventDefault()
    }
    const onTouchEnd = () => {
      pinchDist = 0
    }

    canvas.addEventListener("pointerdown", onDown)
    canvas.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("touchmove", onTouchMove, { passive: false })
    canvas.addEventListener("touchend", onTouchEnd)

    let raf = 0
    let last = performance.now()
    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (autoRotate) yaw += dt * 0.12
      gl.uniform1f(uYaw, yaw)
      gl.uniform1f(uPitch, pitch)
      gl.uniform1f(uFov, fov)
      gl.uniform1f(uAspect, canvas.width / canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("touchmove", onTouchMove)
      canvas.removeEventListener("touchend", onTouchEnd)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [launched, panoramaUrl])

  function launch() {
    setError(false)
    setLoading(true)
    setLaunched(true)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "surface-card relative overflow-hidden",
        fullscreen && "flex flex-col bg-ink-950",
      )}
    >
      <div
        className={cn(
          "relative",
          fullscreen ? "flex-1" : "h-72 sm:h-96 lg:h-120",
        )}
      >
        {!launched && (
          <>
            {posterImage ? (
              <Image
                src={posterImage}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-brand-aurora" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={launch}
                className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-elevated transition-colors hover:bg-white"
              >
                <Compass className="h-4 w-4" />
                Launch 360° Tour
              </button>
            </div>
          </>
        )}

        {launched && !error && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 size-full touch-none cursor-grab active:cursor-grabbing"
          />
        )}

        {launched && loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/40 text-white">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-950/70 text-center text-white">
            <p className="text-sm">The 360° tour couldn&apos;t load.</p>
            <button
              type="button"
              onClick={launch}
              className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-white"
            >
              Try again
            </button>
          </div>
        )}

        {launched && !error && (
          <>
            <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Compass className="size-3.5" />
              360°
            </span>
            {!loading && (
              <span className="pointer-events-none absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink-950/45 px-3 py-1 text-[0.7rem] text-white/90 backdrop-blur-sm">
                <MousePointer2 className="size-3" />
                Drag to look around • scroll to zoom
              </span>
            )}
            <div className="absolute right-3 top-3">
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink-700 transition-colors hover:bg-white"
              >
                {fullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {!fullscreen && (
        <div className="px-4 py-3 text-xs text-ink-500">{title}</div>
      )}
    </div>
  )
}
