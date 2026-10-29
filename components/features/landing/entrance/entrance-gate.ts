/**
 * Waits for one image to load and decode.
 *
 * @param img - The image to wait for.
 * @returns True if it loaded and decoded, false if it failed.
 */
async function settleImage(img: HTMLImageElement): Promise<boolean> {
  // Wait for the load unless it already finished before hydration
  if (!img.complete) {
    await new Promise<void>((resolve) => {
      img.addEventListener("load", () => resolve(), { once: true });
      img.addEventListener("error", () => resolve(), { once: true });
    });
  }
  if (img.naturalWidth === 0) return false;

  // Decode so the card never paints half-ready. A decode that rejects after a
  // good load (Safari can) still leaves a usable image, so it is kept.
  await img.decode().catch(() => {});

  return true;
}

/**
 * The loading gate: resolves once every image has loaded and decoded, with no
 * time ceiling. A failed image counts as settled but is reported as failed.
 *
 * @param images - The stack images, in tile order.
 * @param onSettle - Called each time an image settles, with how many have.
 * @returns For each image, whether it loaded.
 */
export async function waitForImages(
  images: HTMLImageElement[],
  onSettle: (settled: number) => void,
): Promise<boolean[]> {
  let settled = 0;

  return Promise.all(
    images.map(async (img) => {
      const loaded = await settleImage(img);
      onSettle(++settled);

      return loaded;
    }),
  );
}
