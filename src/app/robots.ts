import { MetadataRoute } from "next";
import { ALLOW_INDEXING, DEFAULT_META } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    // Pre-launch: keep crawlers out and do not advertise a sitemap.
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/signup", "/auth/"],
    },
    sitemap: `${DEFAULT_META.url}/sitemap.xml`,
  };
}
