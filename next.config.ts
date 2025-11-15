import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
  i18n: {
    locales: [
      "en",
      "zh",
      "es",
      "hi",
      "ar",
      "pt",
      "bn",
      "ru",
      "ja",
      "de",
      "fr",
      "ur",
      "id",
      "it",
      "tr",
    ],
    defaultLocale: "en",
  },
};

export default nextConfig;
