// React and Next.js
import { act, useEffect } from "react";

// Third-party libraries
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Local modules
import type { MotionController } from "../motion-controller";
import { useEntrance } from "./entrance-context";
import { ENTRANCE_STATE_ATTRIBUTE } from "./entrance-script";
import { LandingEntrance } from "./landing-entrance";

const timeline = vi.hoisted(() => ({ finish: () => {} }));

vi.mock("./entrance-timeline", () => ({
  buildEntranceTimeline: ({ onComplete }: { onComplete: () => void }) => {
    timeline.finish = onComplete;

    return { kill: () => {} };
  },
}));

/**
 * Registers a controller with the Entrance and shows whether it is done.
 *
 * @param props.controller - The controller to register.
 * @returns The done flag as text.
 */
function Probe({ controller }: { controller: MotionController }) {
  const { entranceDone, registerController } = useEntrance();

  useEffect(
    () => registerController(controller),
    [controller, registerController],
  );

  return <p>{entranceDone ? "done" : "waiting"}</p>;
}

describe("LandingEntrance", () => {
  const controller = { start: vi.fn(), destroy: vi.fn() };

  beforeEach(() => controller.start.mockClear());
  afterEach(() =>
    document.documentElement.removeAttribute(ENTRANCE_STATE_ATTRIBUTE),
  );

  it("keeps controllers paused until the timeline completes", () => {
    document.documentElement.setAttribute(ENTRANCE_STATE_ATTRIBUTE, "pending");

    render(
      <LandingEntrance>
        <Probe controller={controller} />
      </LandingEntrance>,
    );
    expect(controller.start).not.toHaveBeenCalled();
    expect(screen.getByText("waiting")).toBeTruthy();

    act(() => timeline.finish());
    expect(controller.start).toHaveBeenCalledTimes(1);
    expect(screen.getByText("done")).toBeTruthy();
    expect(
      document.documentElement.hasAttribute(ENTRANCE_STATE_ATTRIBUTE),
    ).toBe(false);
  });

  it("starts straight away when no Entrance was marked", () => {
    render(
      <LandingEntrance>
        <Probe controller={controller} />
      </LandingEntrance>,
    );

    expect(controller.start).toHaveBeenCalled();
    expect(screen.getByText("done")).toBeTruthy();
  });
});
