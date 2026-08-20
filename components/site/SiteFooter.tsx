'use client';

/* フッター。トップ（#after の末尾）と下層で同じものを使う。

   いま開いているページへのリンクは出さない（自分への行き止まりを作らない）。
   トップだけは #after の中に置かれるので、色は #after のトークンが効く
   ＝墨に反転した節の近くでは白くなる。下層では .pg のトークンが効く。 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteFooter({ className }: { className?: string }) {
  const here = usePathname();
  return (
    <div id="foot" className={className}>
      <span>© UTUTU Inc.</span>
      <span className="pages">
        {here !== '/about' && <Link href="/about">会社概要</Link>}
        {here !== '/contact' && <Link href="/contact">お問い合わせ</Link>}
        {here !== '/' && <Link href="/">トップ</Link>}
      </span>
    </div>
  );
}
