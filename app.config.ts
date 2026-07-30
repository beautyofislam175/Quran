import { defineConfig } from "@tanstack/react-start/config";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  tsr: {
    appDirectory: "./src",
    routesDirectory: "./src/routes",
    generatedRouteTree: "./src/routeTree.gen.ts",
  },
  vite: {
    plugins: [tailwindcss(), tsConfigPaths()],
  },
  server: {
    // Render sets NITRO_PRESET=node-server; Nitro reads it automatically.
    // Explicit fallback keeps local builds working without the env var.
    preset: (process.env.NITRO_PRESET as "node-server") ?? "node-server",
    entry: "./src/server.ts",
  },
});
