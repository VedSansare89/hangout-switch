import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hangout Switch",
    short_name: "Hangout Switch",
    description:
      "A conversation-first party game for friends and couples. Pick a mode, set the intensity, and let the games begin.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdf2f8",
    theme_color: "#ec4899",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
