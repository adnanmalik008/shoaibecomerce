import type { MetadataRoute } from "next";
import { legalNav, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = ["", "/course", "/about", "/success-stories", "/enroll"].map(
    (path) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.8,
    })
  );

  const legal: MetadataRoute.Sitemap = legalNav.map(({ href }) => ({
    url: `${site.url}${href}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  }));

  return [...pages, ...legal];
}
