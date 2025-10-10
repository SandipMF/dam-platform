import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: "esbuild", // or 'terser' if you need more aggressive compression
    chunkSizeWarningLimit: 1000,
  },
});
