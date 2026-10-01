'use client';

/* ページをまたぐリンク。押すと、押した場所から網点が画面を塗りつぶし、
   粒が集まって行き先の名前（COMPANY / CONTACT / STUDIO …）になる。
   覆い終わってから遷移し、新しいページで覆いが剥がれる（components/dots/DotField.tsx）。

   同じページの中のアンカー（トップの #services など）は、座標の世界（lib/world）が受け持つ。
   点描が使えない環境では、ふつうの Link として動く */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';
import { dots } from '@/lib/dots/field';

let lastPt = { x: -1, y: -1 };
/** pending：覆ったまま遷移中 ／ used：一度でも遷移した（初回の演出を繰り返さないため） */
export const transit = { pending: false, used: false };

const WORDS: Record<string, string> = {
  '/': 'STUDIO', '/#top': 'STUDIO', '/#services': 'SERVICES', '/#work': 'WORK', '/#team': 'TEAM',
  '/#contact-cta': 'CONTACT', '/company': 'COMPANY', '/company#contact': 'CONTACT',
};

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string; word?: string };

export function TLink({ href, word, onClick, children, ...rest }: Props) {
  const router = useRouter();
  const path = usePathname();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => { lastPt = { x: e.clientX, y: e.clientY }; onClick?.(e); }}
      onNavigate={(e) => {
        const url = new URL(href, location.href);
        if (url.pathname === path || !dots.ok) return;
        e.preventDefault();
        transit.pending = true;
        transit.used = true;
        const x = lastPt.x > 0 ? lastPt.x : innerWidth / 2;
        const y = lastPt.y > 0 ? lastPt.y : innerHeight / 2;
        lastPt = { x: -1, y: -1 };
        document.body.classList.remove('menu-open');
        dots.coverIn({ x, y, color: '#0E0E0D', word: word ?? WORDS[url.pathname + url.hash] ?? WORDS[url.pathname] }).then(() => {
          if (!url.hash) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          router.push(href, { scroll: false });
        });
      }}
    >
      {children}
    </Link>
  );
}
