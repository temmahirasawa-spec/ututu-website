/* robots.txt。クロール自体は常に許可しておく。
   公開前の「検索に出さない」は layout.tsx の robots: noindex が担っている
   （robots.txt で拒否すると noindex を読めなくなり、外部リンク経由で
   逆に登録されてしまうため。layout.tsx のコメント参照）。 */

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ututu-website.vercel.app'}/sitemap.xml`,
  };
}
