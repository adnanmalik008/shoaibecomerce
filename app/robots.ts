import type { MetadataRoute } from "next";

// Paid-traffic landing page: nothing here should be crawled or indexed, and no
// sitemap is published. Visitors arrive from ads, never from search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
