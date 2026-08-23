/* sitemap.xml。ページを足したらここにも足すこと。 */

import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ututu-website.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/company`, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
