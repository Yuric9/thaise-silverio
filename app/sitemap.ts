import type { MetadataRoute } from "next";
import { getPublicSite } from "../lib/server/site";
import { SITE_URL } from "../lib/site-content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { content } = await getPublicSite();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...(content.course.published
      ? [
          {
            url: `${SITE_URL}/curso`,
            changeFrequency: "monthly" as const,
            priority: 0.8,
          },
        ]
      : []),
  ];
}
