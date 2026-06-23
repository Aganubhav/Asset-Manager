import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;
if (!rawPort) throw new Error("PORT env required");
const port = Number(rawPort);
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [tailwindcss()],
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        dashboard: path.resolve(import.meta.dirname, "dashboard.html"),
        tasks: path.resolve(import.meta.dirname, "tasks.html"),
        notes: path.resolve(import.meta.dirname, "notes.html"),
        pomodoro: path.resolve(import.meta.dirname, "pomodoro.html"),
        planner: path.resolve(import.meta.dirname, "planner.html"),
        goals: path.resolve(import.meta.dirname, "goals.html"),
        habits: path.resolve(import.meta.dirname, "habits.html"),
        analytics: path.resolve(import.meta.dirname, "analytics.html"),
        achievements: path.resolve(import.meta.dirname, "achievements.html"),
      }
    }
  },
  server: { port, strictPort: true, host: "0.0.0.0", allowedHosts: true },
  preview: { port, host: "0.0.0.0", allowedHosts: true },
});