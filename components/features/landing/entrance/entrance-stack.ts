// Local modules
import { ENTRANCE_CONFIG } from "./entrance-config";

/** A rectangle in viewport pixels. */
export type StackRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** The transform that carries a card from its natural slot into the stack. */
export type StackTransform = { x: number; y: number; scale: number };

/**
 * Sizes and places the stack: centred in the full viewport, `stackWidth` wide
 * at the configured aspect ratio.
 *
 * @param viewportWidth - Viewport width in px.
 * @param viewportHeight - Viewport height in px.
 * @returns The stack rectangle in viewport pixels.
 */
export function getStackRect(
  viewportWidth: number,
  viewportHeight: number,
): StackRect {
  const { min, vw, max } = ENTRANCE_CONFIG.stackWidth;
  const width = Math.min(max, Math.max(min, viewportWidth * vw));
  const height = width / ENTRANCE_CONFIG.stackAspect;

  return {
    left: (viewportWidth - width) / 2,
    top: (viewportHeight - height) / 2,
    width,
    height,
  };
}

/**
 * Works out the transform from a card's natural slot to the stack. Cards scale
 * about their centre, so only the centres need to meet.
 *
 * @param slot - The card's natural slot, measured with no transform applied.
 * @param stack - The stack rectangle.
 * @returns The x and y offset in px and the scale that fits the card to the stack.
 */
export function getStackTransform(
  slot: StackRect,
  stack: StackRect,
): StackTransform {
  const slotX = slot.left + slot.width / 2;
  const slotY = slot.top + slot.height / 2;

  return {
    x: stack.left + stack.width / 2 - slotX,
    y: stack.top + stack.height / 2 - slotY,
    scale: slot.width > 0 ? stack.width / slot.width : 1,
  };
}
