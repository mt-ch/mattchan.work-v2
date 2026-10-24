"use client";

import { Blobatar } from "@blobatar/react";
import { useGaze } from "@blobatar/react/gaze";

import { wink } from "blobatar/expression";
import "blobatar/motion.css";
import "blobatar/gaze.css";

export function Avatar() {
  const { ref } = useGaze({ travel: 3, lookAt: "pointer" });

  return (
    <Blobatar
      ref={ref}
      name="malin"
      className="h-18 w-auto"
      traits={{
        shape: 0.745,
        "body.ratio": 0.151,
        "eye.ratio": 0.293,
        "eye.lean": 0.365,
        hue: 0.425,
        "nub.n": 0.75,
        "nub.a0": 0.036,
        "nub.r0": 0.443,
      }}
      expression={wink}
      animate="always"
    />
  );
}
