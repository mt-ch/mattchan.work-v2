// Third-party libraries
import { describe, expect, it } from "vitest";

// Local modules
import { queueConfig } from "./config";
import { layoutQueue } from "./queue-layout";
import { MAX_QUEUE_VIDEOS, pickQueuePlaying } from "./queue-video";

const viewport = { width: 1280, height: 800 };
const cardsAt = (position: number) =>
  layoutQueue({ count: 20, config: queueConfig, position, viewport });
const always = () => true;

describe("pickQueuePlaying", () => {
  it("plays the focus card and one neighbour, never more than the cap", () => {
    const playing = pickQueuePlaying(cardsAt(5), always);

    expect(playing.size).toBe(MAX_QUEUE_VIDEOS);
    expect(playing.has("5")).toBe(true);
  });

  it("moves with the focus as the queue moves", () => {
    expect(pickQueuePlaying(cardsAt(5), always).has("5")).toBe(true);
    expect(pickQueuePlaying(cardsAt(9), always).has("9")).toBe(true);
    expect(pickQueuePlaying(cardsAt(9), always).has("5")).toBe(false);
  });

  it("skips cards without a video and never promotes a far card", () => {
    const onlyFar = (index: number) => index === 12;
    const playing = pickQueuePlaying(cardsAt(5), onlyFar);

    expect(playing.size).toBe(0);
  });

  it("returns nothing for an empty queue", () => {
    expect(pickQueuePlaying([], always).size).toBe(0);
  });
});
