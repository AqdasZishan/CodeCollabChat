import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Import the path module

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Example alias for the src directory
      "@components": path.resolve(__dirname, "./src/components"), // Alias for the components folder
    },
  },
  plugins: [react()],
  server: {
    host: "0.0.0.0",
  },
});
