import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // honor the harness/host-assigned port when present
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
});
