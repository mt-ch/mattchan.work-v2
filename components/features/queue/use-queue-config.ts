// React and Next.js
import { useEffect, useState } from "react";

// Local modules
import { queueConfig, type QueueConfig } from "./config";
import { loadQueueOverrides } from "./config-overrides";

/**
 * The Queue's effective config: the code defaults, plus localStorage
 * overrides and a live tuning panel only when `?debug` is in the URL.
 *
 * @returns The config to render with; a new object whenever the panel changes it.
 */
export function useQueueConfig(): QueueConfig {
  const [config, setConfig] = useState<QueueConfig>(queueConfig);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("debug")) return;

    // Edit a private copy in place; publish a fresh copy to re-render
    const live = loadQueueOverrides();
    const publish = () => setConfig({ ...live });
    publish();

    // The panel is a dynamic import, so it never loads without `?debug`
    let close: (() => void) | undefined;
    let cancelled = false;
    void import("./debug-panel").then(async ({ openQueueDebugPanel }) => {
      const dispose = await openQueueDebugPanel(live, publish);
      if (cancelled) dispose();
      else close = dispose;
    });

    return () => {
      cancelled = true;
      close?.();
    };
  }, []);

  return config;
}
