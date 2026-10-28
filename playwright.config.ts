// Third-party libraries
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: "e2e-project",
      NEXT_PUBLIC_SANITY_DATASET: "v2",
    },
  },
  use: { baseURL: "http://localhost:3000" },
});
