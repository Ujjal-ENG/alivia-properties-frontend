// Client-side helper that assembles several flat room photos into a single
// equirectangular (2:1) panorama the in-app 360° viewer can render.
//
// This is NOT feature-based stitching — each photo is placed into its own
// longitude slice (so the seller supplies them in the order they go around the
// room), seams are cross-faded, and the ceiling/floor are filled with a soft
// gradient sampled from the photo edges. The result is a navigable horizontal
// 360°, clearly an "assembled" tour rather than a true captured panorama.

/**
 * Load an image with CORS enabled so the resulting canvas is never tainted —
 * we need `getImageData`/`toBlob` to work. Our two sources both send the
 * required headers (MinIO uploads echo the origin; Unsplash returns `*`), and
 * blob/data URLs are same-origin, so `crossOrigin = "anonymous"` is safe.
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load image: ${url}`))
    img.src = url
  })
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const imgRatio = img.width / img.height
  const boxRatio = w / h
  let sw: number, sh: number, sx: number, sy: number
  if (imgRatio > boxRatio) {
    sh = img.height
    sw = sh * boxRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / boxRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
}

/** Fade the left/right edges to transparent so adjacent slices cross-fade. */
function featherSides(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fade: number,
) {
  if (fade <= 0) return
  ctx.globalCompositeOperation = "destination-in"
  const g = ctx.createLinearGradient(0, 0, w, 0)
  const stop = Math.min(0.49, fade / w)
  g.addColorStop(0, "rgba(0,0,0,0)")
  g.addColorStop(stop, "rgba(0,0,0,1)")
  g.addColorStop(1 - stop, "rgba(0,0,0,1)")
  g.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = "source-over"
}

function averageRow(
  ctx: CanvasRenderingContext2D,
  w: number,
  y: number,
): [number, number, number] {
  try {
    const data = ctx.getImageData(0, y, w, 1).data
    let r = 0,
      g = 0,
      b = 0
    for (let i = 0; i < w; i++) {
      r += data[i * 4]
      g += data[i * 4 + 1]
      b += data[i * 4 + 2]
    }
    return [Math.round(r / w), Math.round(g / w), Math.round(b / w)]
  } catch {
    return [205, 205, 205]
  }
}

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))

export type AssembleOptions = { width?: number; verticalFovDeg?: number }

/**
 * Assemble ordered photos into an equirectangular panorama canvas.
 * @param images photos in the order they go around the room (left → right)
 */
export function assembleEquirectangular(
  images: HTMLImageElement[],
  { width = 4096, verticalFovDeg = 122 }: AssembleOptions = {},
): HTMLCanvasElement {
  const W = width
  const H = Math.round(W / 2)
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new Error("Canvas 2D is not available")

  ctx.fillStyle = "#16201e"
  ctx.fillRect(0, 0, W, H)

  // Vertical band that the photos occupy (centred on the horizon).
  const lat = ((verticalFovDeg / 2) * Math.PI) / 180
  const yTop = Math.round(((Math.PI / 2 - lat) / Math.PI) * H)
  const yBot = Math.round(((Math.PI / 2 + lat) / Math.PI) * H)
  const bandH = yBot - yTop

  const n = images.length
  const sliceW = W / n
  const overlap = Math.round(sliceW * 0.12)

  for (let i = 0; i < n; i++) {
    const dw = Math.ceil(sliceW + overlap)
    const tmp = document.createElement("canvas")
    tmp.width = dw
    tmp.height = bandH
    const tctx = tmp.getContext("2d")
    if (!tctx) continue
    drawCover(tctx, images[i], dw, bandH)
    featherSides(tctx, dw, bandH, overlap)
    let x = Math.round(i * sliceW - overlap / 2)
    x = ((x % W) + W) % W
    ctx.drawImage(tmp, x, yTop)
    // Wrap the slice that crosses the right edge back to the left for a seamless 360°.
    if (x + dw > W) ctx.drawImage(tmp, x - W, yTop)
  }

  // Soft ceiling fill (sampled from the top edge → slightly lighter at the zenith).
  const [tr, tg, tb] = averageRow(ctx, W, yTop + 1)
  const top = ctx.createLinearGradient(0, yTop, 0, 0)
  top.addColorStop(0, `rgb(${tr},${tg},${tb})`)
  top.addColorStop(1, `rgb(${clamp(tr + 16)},${clamp(tg + 16)},${clamp(tb + 16)})`)
  ctx.fillStyle = top
  ctx.fillRect(0, 0, W, yTop)

  // Soft floor fill (sampled from the bottom edge → slightly darker at the nadir).
  const [br, bg, bb] = averageRow(ctx, W, yBot - 1)
  const bottom = ctx.createLinearGradient(0, yBot, 0, H)
  bottom.addColorStop(0, `rgb(${br},${bg},${bb})`)
  bottom.addColorStop(1, `rgb(${clamp(br - 26)},${clamp(bg - 26)},${clamp(bb - 26)})`)
  ctx.fillStyle = bottom
  ctx.fillRect(0, yBot, W, H - yBot)

  return canvas
}

export function canvasToFile(
  canvas: HTMLCanvasElement,
  name = "panorama-360.jpg",
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], name, { type: "image/jpeg" }))
          : reject(new Error("Could not export the panorama image")),
      "image/jpeg",
      0.9,
    )
  })
}
