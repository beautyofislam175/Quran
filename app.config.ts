import { createApp } from "vinxi";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

const sharedPlugins = () => [
  TanStackRouterVite({
    target: "react",
    autoCodeSplitting: true,
    routesDirectory: "./src/routes",
    generatedRouteTree: "./src/routeTree.gen.ts",
  }),
  react(),
  tailwindcss(),
  tsConfigPaths(),
];

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    {
      name: "ssr",
      type: "http",
      entry: "./src/server.ts",
      target: "server",
      plugins: sharedPlugins,
    },
    {
      name: "client",
      type: "client",
      entry: "./src/client.tsx",
      target: "browser",
      base: "/_build/",
      plugins: sharedPlugins,
    },
  ],
});
