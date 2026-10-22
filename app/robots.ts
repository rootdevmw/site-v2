import type { MetadataRoute } from "next";
import { church } from "@/config/church";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/login",
        "/register",
        "/set-password",
        "/reset-password",
        "/api/",
      ],
    },
    sitemap: church.siteUrl + "/sitemap.xml",
    host: church.siteUrl,
  };
}
