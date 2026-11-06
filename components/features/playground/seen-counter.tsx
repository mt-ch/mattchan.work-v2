"use client";

// React and Next.js
import { useLayoutEffect, useRef } from "react";

// Third-party libraries
import { gsap } from "gsap";

// Shared modules
import { prefersReducedMotion } from "@/lib/motion/environment";
import { useMotionAllowed } from "@/lib/motion/use-motion-allowed";

/** Seconds the count rolls and the fill eases when a piece is seen. */
const ROLL_DURATION = 0.4;

/**
 * Writes the count and fill, rolling and easing to them when motion is
 * allowed and the count went up, and jumping straight there otherwise.
 *
 * @param seen - Pieces seen.
 * @param total - Pieces that exist.
 * @param animate - Whether motion is allowed.
 * @returns Refs for the count text and the fill, to attach to elements.
 */
function useRollingProgress(seen: number, total: number, animate: boolean) {
  const countRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const shown = useRef(seen);

  useLayoutEffect(() => {
    const count = countRef.current;
    const fill = fillRef.current;
    if (!count || !fill) return;

    const width = `${total > 0 ? (seen / total) * 100 : 0}%`;
    if (!animate || seen <= shown.current) {
      count.textContent = String(seen);
      gsap.set(fill, { width });
      shown.current = seen;

      return;
    }

    // Roll the number up from what is shown now
    const rolling = { value: shown.current };
    const tween = gsap.to(rolling, {
      value: seen,
      duration: ROLL_DURATION,
      ease: "power2.out",
      onUpdate: () => {
        shown.current = Math.round(rolling.value);
        count.textContent = String(shown.current);
      },
      onComplete: () => {
        shown.current = seen;
      },
    });
    const ease = gsap.to(fill, {
      width,
      duration: ROLL_DURATION,
      ease: "power2.out",
    });

    return () => {
      tween.kill();
      ease.kill();
    };
  }, [seen, total, animate]);

  return { countRef, fillRef };
}

/**
 * A pill over the Playground showing how many pieces the visitor has seen out
 * of the total, with a green fill behind it. Hidden from assistive technology
 * and from the pointer, so drags that start on it still pan the canvas.
 *
 * @param props.seen - Pieces seen.
 * @param props.total - Pieces that exist.
 * @returns The counter.
 */
export function SeenCounter({ seen, total }: { seen: number; total: number }) {
  const animate = useMotionAllowed();
  const { countRef, fillRef } = useRollingProgress(seen, total, animate);
  const rootRef = useRef<HTMLDivElement>(null);
  const complete = total > 0 && seen >= total;

  // Fade in when the counter first appears
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const fade = gsap.from(rootRef.current, { opacity: 0, duration: 0.5 });

    return () => {
      fade.kill();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2"
    >
      <div className="relative overflow-hidden rounded-full bg-black/60 px-3 py-1.5 text-sm text-white backdrop-blur-md md:px-4 md:py-2 md:text-base">
        <div
          ref={fillRef}
          className="absolute inset-y-0 left-0 bg-seen-fill/60"
        />
        <span className="relative font-mono tabular-nums">
          <span ref={countRef} className="text-seen-count" />/{total}{" "}
          {complete ? "🎉" : "👀"}
        </span>
      </div>
    </div>
  );
}
