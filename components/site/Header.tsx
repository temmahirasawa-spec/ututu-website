'use client';

/* サイト共通のヘッダーとメニュー。layout.tsx に置いてあり、ページを移っても作り直さない。
   CSS は globals.css の「ヘッダー」「メニュー」。

   メニューは**サイトの構造どおり**に組む（2026-10-02 本人指摘：構造とメニューがずれていた）。
     大きな行 ＝ ページ（Studio＝トップ ／ Works ／ Company ／ Contact）
     その下の小さな行 ＝ そのページの中の節（トップの Services・Team・Message、Works の Branding・SaaS）
   いま開いているページの行には印（朱の点）を付ける。
   その下に PRODUCTS（見出し。**押せない**）→ 2つのLP。PRODUCTS を押せるようにしないこと。
   押し先は2つしかなく、見出しにも道をつけると、どれが本当の行き先か分からなくなる。
   LP はサイトの外なので新タブの印をつける */

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { dots } from '@/lib/dots/field';
import { Mark } from './Mark';
import { PRODUCT_URL } from './productLinks';
import { TLink } from './TLink';

type Sub = { href: string; en: string; jp: string };
const NAV: { href: string; path: string; en: string; jp: string; subs: Sub[] }[] = [
  {
    href: '/#top', path: '/', en: 'Studio', jp: 'トップ',
    subs: [
      { href: '/#services', en: 'Services', jp: 'できること' },
      { href: '/#team', en: 'Team', jp: 'チーム' },
      { href: '/#why', en: 'Message', jp: 'メッセージ' },
    ],
  },
  {
    href: '/works', path: '/works', en: 'Works', jp: '実績',
    subs: [
      { href: '/works#branding', en: 'Branding & Produce', jp: '飲食ブランド' },
      { href: '/works#saas', en: 'SaaS', jp: 'GOOD SERIES' },
    ],
  },
  { href: '/company', path: '/company', en: 'Company', jp: '会社概要', subs: [] },
  { href: '/company#contact', path: '', en: 'Contact', jp: 'お問い合わせ', subs: [] },
];

export function Header() {
  const path = usePathname();
  useEffect(() => {
    const close = () => document.body.classList.remove('menu-open');
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); close(); };
  }, []);

  const toggle = () => {
    const open = document.body.classList.toggle('menu-open');
    document.getElementById('menuBtn')?.setAttribute('aria-expanded', String(open));
    if (open) dots.pointerOff();
  };
  const close = () => {
    document.body.classList.remove('menu-open');
    document.getElementById('menuBtn')?.setAttribute('aria-expanded', 'false');
  };

  return (
    <>
      <header className="hd">
        <TLink className="hd-brand" href="/#top" aria-label="UTUTU トップへ" onClick={close}>
          <Mark />
        </TLink>
        <p className="hd-meta" aria-hidden="true">Creative Studio for DX — Kobe - Tokyo, Japan</p>
        <button id="menuBtn" className="hd-menu" type="button" aria-expanded="false" aria-controls="menu" onClick={toggle}>
          <span className="lbl-t">MENU</span>
          <span className="bars" aria-hidden="true"><i /><i /></span>
          <span className="sr">メニューを開く</span>
        </button>
      </header>
      <TLink className="hd-cta" href="/company#contact" onClick={close}><i aria-hidden="true" />相談する</TLink>

      <nav id="menu" className="mn" aria-label="サイト内の行き先">
        <ul className="mn-list">
          {NAV.map((l, i) => (
            <li key={l.href} className={l.subs.length ? 'has-sub' : undefined}>
              <TLink href={l.href} onClick={close} style={{ ['--i' as string]: i }} aria-current={l.path === path ? 'page' : undefined}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="en">{l.en}</span>
                <span className="jp">{l.jp}</span>
              </TLink>
              {l.subs.length > 0 && (
                <ul className="mn-sub" style={{ ['--i' as string]: i }}>
                  {l.subs.map((s) => (
                    <li key={s.href}>
                      <TLink href={s.href} onClick={close}><span>{s.en}</span><small>{s.jp}</small></TLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <div className="mn-foot">
          <div className="mn-prod">
            <p>Products</p>
            <div>
              <a href={PRODUCT_URL.order} target="_blank" rel="noopener">GOOD ORDER<ExtIcon /></a>
              <a href={PRODUCT_URL.review} target="_blank" rel="noopener">GOOD REVIEW<ExtIcon /></a>
            </div>
          </div>
          <p>© UTUTU Inc. — Kobe - Tokyo, Japan</p>
        </div>
      </nav>
    </>
  );
}

/* 新しいタブで開く印 */
export function ExtIcon() {
  return (
    <svg className="ext" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M12.5 9.5V13H3V3.5h3.5" />
      <path d="M9.5 2.5H13.5V6.5" />
      <path d="M13.5 2.5 7.5 8.5" />
    </svg>
  );
}

/* 先へ進む矢印 */
export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11.5M9 3.5 13.5 8 9 12.5" /></svg>
  );
}
