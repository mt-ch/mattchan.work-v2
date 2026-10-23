import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  resolve: {
    alias: { "@": path.dirname(fileURLToPath(import.meta.url)) },
  },
});
