'use client';

/* サイト共通のナビ（ハンバーガー＋メニュー）。トップと /company で使い回す。

   並びの考え方：
     TOP
     COMPANY / CONTACT   … 同じページなので1行に並べる
     ──
     PRODUCTS
     GOOD ORDER | GOOD REVIEW   … **サイトの外**なので下に小さく、新タブの印つき

   CSSは globals.css の「メニュー」の節。 */

import { useEffect } from 'react';

type Props = {
  /** 'top' … トップページ。ページ内の移動で済ませる
   *  'page' … 下層ページ。トップへは実際に遷移する */
  variant?: 'top' | 'page';
  /** ハンバーガーの色。紙の上では墨にする */
  tone?: 'film' | 'ink';
};

export function SiteNav({ variant = 'top', tone = 'film' }: Props) {
  useEffect(() => {
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('menu');
    if (!btn || !menu) return;
    const toggle = () => document.body.classList.toggle('menu-open');
    const close = (e: Event) => {
      if ((e.target as HTMLElement).closest('a')) document.body.classList.remove('menu-open');
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') document.body.classList.remove('menu-open');
    };
    btn.addEventListener('click', toggle);
    menu.addEventListener('click', close);
    window.addEventListener('keydown', esc);
    return () => {
      btn.removeEventListener('click', toggle);
      menu.removeEventListener('click', close);
      window.removeEventListener('keydown', esc);
      document.body.classList.remove('menu-open');
    };
  }, []);

  const onTop = variant === 'top';

  /* トップページでの「TOP」は、ページを読み直さずに先頭へ戻す。
     **ロゴ（#brand）の click を借りること。**あちらは映像区間の
     スクロール固定を解いてから戻す処理まで持っている */
  const goTop = (e: React.MouseEvent) => {
    if (!onTop) return;
    e.preventDefault();
    document.body.classList.remove('menu-open');
    document.getElementById('brand')?.click();
  };

  return (
    <>
      <button id="menuBtn" className={tone === 'ink' ? 'on-paper' : undefined} aria-label="メニュー">
        <span /><span /><span />
      </button>
      <nav id="menu">
        <ul className="menu-main">
          <li>
            <a href={onTop ? '#' : '/'} onClick={goTop}>TOP<small>トップ</small></a>
          </li>
          <li className="menu-pair">
            <a href="/company">COMPANY</a>
            <span className="sep" aria-hidden="true">/</span>
            <a href="/company#contact">CONTACT</a>
            <small>会社概要・お問い合わせ</small>
          </li>
          <li aria-hidden="true"><hr className="menu-rule" /></li>
          <li>
            <a href={onTop ? '#after' : '/#after'}>PRODUCTS<small>プロダクト</small></a>
          </li>
        </ul>

        {/* サイトの外にあるもの。小さく、新タブで開く印をつける */}
        <div className="menu-ext">
          <a href="https://good-order.jp" target="_blank" rel="noopener">GOOD ORDER<ExtIcon /></a>
          <span className="bar" aria-hidden="true" />
          <a href="https://good-review.jp" target="_blank" rel="noopener">GOOD REVIEW<ExtIcon /></a>
        </div>
      </nav>
    </>
  );
}

/* 新しいタブで開く印 */
function ExtIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M12.5 9.5V13H3V3.5h3.5" />
      <path d="M9.5 2.5H13.5V6.5" />
      <path d="M13.5 2.5 7.5 8.5" />
    </svg>
  );
}
