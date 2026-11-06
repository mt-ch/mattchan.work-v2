// Third-party libraries
import { gsap } from "gsap";

/**
 * Fades the dot grid in, then staggers the tiles in from the viewport centre.
 * Takes about 1.2s.
 *
 * @param viewport - The canvas viewport, whose centre the stagger starts from.
 * @param dots - The dot grid element.
 */
export function playIntro(viewport: HTMLElement, dots: HTMLElement) {
  gsap.to(dots, { opacity: 1, duration: 0.6, ease: "power1.out" });

  // Stagger by how far each tile sits from the centre
  const bounds = viewport.getBoundingClientRect();
  const centre = {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
  };
  const layers = Array.from(
    viewport.querySelectorAll<HTMLElement>("[data-intro]"),
  );
  const distances = layers.map((layer) => {
    const box = layer.getBoundingClientRect();

    return Math.hypot(
      box.left + box.width / 2 - centre.x,
      box.top + box.height / 2 - centre.y,
    );
  });
  const farthest = Math.max(1, ...distances);

  layers.forEach((layer, i) => {
    gsap.fromTo(
      layer,
      { opacity: 0, scale: 0.85 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.3 + (distances[i] / farthest) * 0.4,
        clearProps: "opacity,scale,transform",
      },
    );
  });
}
