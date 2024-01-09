import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/192.png"],
      manifest: {
        name: "MailFlare - Email Aliases",
        short_name: "MailFlare",
        description: "Create Email aliases for your own domains using Cloudflare Email Routing",
        lang: "en",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        prefer_related_applications: false,
        background_color: "#FFFFFF",
        theme_color: "#FF922B",
        icons: [
          {
            src: "icons/128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "icons/256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/1024.png",
            sizes: "1024x1024",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
