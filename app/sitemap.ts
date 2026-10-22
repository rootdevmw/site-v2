import type { MetadataRoute } from "next";
import { church } from "@/config/church";
const publicLandingPaths = [
  "/",
  "/about",
  "/plan-visit",
  "/contact",
  "/ministries",
  "/homecells",
  "/content",
  "/events",
  "/programs",
  "/publications",
  "/live",
  "/prayer-request",
];
export default function sitemap(): MetadataRoute.Sitemap {
  return publicLandingPaths.map((path) => ({
    url: new URL(path, church.siteUrl).href,
    changeFrequency: path === "/live" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/plan-visit" ? 0.9 : 0.7,
  }));
}
