import { MetadataRoute } from "next";
import { DEFAULT_META } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/signup", "/auth/"],
    },
    sitemap: `${DEFAULT_META.url}/sitemap.xml`,
  };
}
