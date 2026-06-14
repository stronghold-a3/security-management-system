import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { getViteHTTPSConfig } from "./src/middleware/httpsRedirect";

// Use HTTPS in development if needed (optional)
const useHTTPS = process.env.VITE_HTTPS === 'true';

export default defineConfig(({ mode }) => ({
  server: getViteHTTPSConfig(useHTTPS),
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
