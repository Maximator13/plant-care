import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, SITE_URL } from "@/lib/site";

// Private app: only the sign-in and legal pages are indexable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: [...PUBLIC_PATHS], disallow: ["/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
