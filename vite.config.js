import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Vendor alag chunk: app update par users ko antd dobara download nahi karna parta
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/](antd|@ant-design|@rc-component|rc-[a-z-]+)[\\/]/.test(id)) return "vendor-antd";
          return "vendor";
        },
      },
    },
  },
});
