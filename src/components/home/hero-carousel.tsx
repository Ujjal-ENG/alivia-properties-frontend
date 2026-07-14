"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes.config";
import { resolveHeroIcon } from "@/lib/hero-icons";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/hero.types";

type Cta = { label: string; href: string };

type Slide = {
  id: string;
  eyebrow?: string;
  eyebrowIcon: LucideIcon;
  title: string;
  subtitle?: string;
  image?: string;
  primary?: Cta;
  secondary?: Cta;
};

// Shown only when the admin hasn't created any slides yet, so the marketplace
// hero is never empty. Once slides exist in the CMS, those replace these.
const DEFAULT_SLIDES: Slide[] = [
  {
    id: "default-1",
    eyebrow: "Trusted property partner since 2011",
    eyebrowIcon: ShieldCheck,
    title: "Explore apartments across Bangladesh",
    subtitle:
      "Find verified apartments, plots, and commercial spaces that fit your budget and lifestyle.",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80",
    primary: { label: "Browse properties", href: ROUTES.PROPERTIES },
    secondary: { label: "Talk to an advisor", href: ROUTES.CONSULTATION },
  },
  {
    id: "default-2",
    eyebrow: "New launch — booking open",
    eyebrowIcon: Sparkles,
    title: "Own a home in Bangladesh's fastest-growing address",
    subtitle:
      "Pre-launch pricing on Alivia Riverside Towers, Jolshiri Abashon — a limited number of units remain.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
    primary: { label: "View the launch", href: ROUTES.PROJECTS },
    secondary: { label: "Book a site visit", href: ROUTES.CONSULTATION },
  },
  {
    id: "default-3",
    eyebrow: "For overseas & local investors",
    eyebrowIcon: TrendingUp,
    title: "Grow your wealth through verified real estate",
    subtitle:
      "Transparent documentation, rental income opportunities, and a dedicated investment advisor.",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1800&q=80",
    primary: { label: "Explore investments", href: ROUTES.PROPERTIES },
    secondary: { label: "Speak to an advisor", href: ROUTES.CONSULTATION },
  },
];

// Map a CMS slide to the carousel's shape: resolve the icon name to a component,
// drop null fields, and keep a button only when it has both a label and a link.
function toSlide(s: HeroSlide): Slide {
  return {
    id: s.id,
    eyebrow: s.eyebrow ?? undefined,
    eyebrowIcon: resolveHeroIcon(s.eyebrowIcon),
    title: s.title,
    subtitle: s.subtitle ?? undefined,
    image: s.imageUrl ?? undefined,
    primary:
      s.primaryLabel && s.primaryHref
        ? { label: s.primaryLabel, href: s.primaryHref }
        : undefined,
    secondary:
      s.secondaryLabel && s.secondaryHref
        ? { label: s.secondaryLabel, href: s.secondaryHref }
        : undefined,
  };
}

const SLIDE_DURATION = 6000;
const SWIPE_THRESHOLD = 44;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(REDUCED_MOTION_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export function HeroCarousel({ slides }: { slides?: HeroSlide[] } = {}) {
  const SLIDES = useMemo(
    () => (slides && slides.length > 0 ? slides.map(toSlide) : DEFAULT_SLIDES),
    [slides],
  );
  const count = SLIDES.length;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [docHidden, setDocHidden] = useState(false);
  const reduced = usePrefersReducedMotion();

  const fillRef = useRef<HTMLSpanElement>(null);
  const elapsedRef = useRef(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const playing = !reduced && !userPaused && !hovered && !focused && !docHidden;

  const goTo = useCallback(
    (next: number) => setIndex((next + count) % count),
    [count],
  );
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  // Reset the progress track whenever the slide changes. Under reduced motion
  // the track sits full (no animation) so the active dot never looks empty.
  useEffect(() => {
    elapsedRef.current = 0;
    if (fillRef.current) {
      fillRef.current.style.transform = reduced ? "scaleX(1)" : "scaleX(0)";
    }
  }, [index, reduced]);

  // A single rAF loop drives both the progress fill and the auto-advance, so the
  // gold indicator *is* the timer. Pausing keeps elapsed time, so it resumes.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      const progress = Math.min(elapsedRef.current / SLIDE_DURATION, 1);
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progress})`;
      }
      if (progress >= 1) {
        setIndex((i) => (i + 1) % count);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, index, count]);

  // Pause auto-rotation while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp(e: React.PointerEvent) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  }

  const active = SLIDES[index];
  const EyebrowIcon = active.eyebrowIcon;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Alivia Properties highlights"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="relative isolate flex min-h-136 items-center overflow-hidden bg-brand-950 md:min-h-160"
    >
      {/* Slide imagery (atmospheric — the text below carries the meaning) */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
            {/* Brand teal scrim: bottom-up for the copy, plus a left wash for legibility */}
            <div className="absolute inset-0 bg-linear-to-t from-brand-950/92 via-brand-950/55 to-brand-950/25" />
            <div className="absolute inset-0 bg-linear-to-r from-brand-950/70 via-brand-950/10 to-transparent" />
          </div>
        ))}
      </div>

      <div className="container-page max-w-373! relative z-10 py-20 md:py-28">
        <div
          aria-live={playing ? "off" : "polite"}
          className="max-w-2xl text-white"
        >
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${count}`}
            className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none"
          >
            {active.eyebrow ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                <EyebrowIcon aria-hidden="true" className="size-3.5 text-gold-300" />
                {active.eyebrow}
              </span>
            ) : null}

            <h1 className="text-h1 mt-5 text-balance font-heading font-bold text-white">
              {active.title}
            </h1>

            {active.subtitle ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                {active.subtitle}
              </p>
            ) : null}

            {(active.primary || active.secondary) ? (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {active.primary ? (
                  <Link href={active.primary.href}>
                    <Button
                      size="lg"
                      className="gap-2 rounded-full bg-gold-400 px-6 font-bold text-brand-950 shadow-md shadow-gold-950/20 hover:bg-gold-300"
                    >
                      {active.primary.label}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Button>
                  </Link>
                ) : null}
                {active.secondary ? (
                  <Link href={active.secondary.href}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full border-white/30 bg-white/10 px-6 font-semibold text-white hover:bg-white/20 hover:text-white"
                    >
                      {active.secondary.label}
                    </Button>
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Controls — grouped at the bottom so they never collide with the copy */}
      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="liquid-glass-control glass-interactive flex size-11 items-center justify-center rounded-full text-brand-900 transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>

          <div className="flex items-center gap-2 px-2">
            {SLIDES.map((slide, i) => {
              const isActive = i === index;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className="flex h-11 items-center justify-center px-0.5 focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "block h-2 overflow-hidden rounded-full transition-[width,background-color] duration-300",
                      isActive
                        ? "w-7 bg-white/35"
                        : "w-2 bg-white/50 hover:bg-white/80",
                    )}
                  >
                    {isActive && (
                      <span
                        ref={fillRef}
                        style={{ transform: reduced ? "scaleX(1)" : "scaleX(0)" }}
                        className="block h-full w-full origin-left rounded-full bg-gold-400"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="liquid-glass-control glass-interactive flex size-11 items-center justify-center rounded-full text-brand-900 transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>

          {!reduced && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              className="liquid-glass-control glass-interactive ml-1 flex size-11 items-center justify-center rounded-full text-brand-900 transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
            >
              {userPaused ? (
                <Play aria-hidden="true" className="size-4" />
              ) : (
                <Pause aria-hidden="true" className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
