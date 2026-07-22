import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const reactRoutes = new Set([
  "/", "/hall", "/chamber-of-creation", "/artisan-bench", "/academy",
  "/bespoke-atelier", "/library", "/artisan-register", "/artisan-login",
  "/artisan-forgot-password", "/artisan-reset-password",
  "/my-artisan-id", "/hall-archive"
]);

const preferReactRoutes = () => ({
  name: "prefer-react-routes",
  enforce: "pre" as const,
  configureServer(server: { middlewares: { use: (handler: (request: { url?: string }, response: unknown, next: () => void) => void) => void } }) {
    server.middlewares.use((request, _response, next) => {
      const pathname = request.url?.split(/[?#]/, 1)[0] ?? "";
      if (reactRoutes.has(pathname.replace(/\/$/, "") || "/")) request.url = "/index.html";
      next();
    });
  },
  configurePreviewServer(server: { middlewares: { use: (handler: (request: { url?: string }, response: unknown, next: () => void) => void) => void } }) {
    server.middlewares.use((request, _response, next) => {
      const pathname = request.url?.split(/[?#]/, 1)[0] ?? "";
      if (reactRoutes.has(pathname.replace(/\/$/, "") || "/")) request.url = "/index.html";
      next();
    });
  }
});

export default defineConfig({
  plugins: [preferReactRoutes(), react()]
});
