'use client';

/* ロゴとハンバーガーメニュー。トップと下層で同じものを使う。

   もとは Hero.tsx に直書きだったが、下層ページでも要るので分けた。
   **KV固有の挙動は Hero 側に残してある。**ロゴの遊び（すべる／裏返す）と、
   押したら先頭へ戻る動きは heroEngine が #brand を掴んで付けているので、
   ここには持ち込まないこと。

   variant で2通り。
     hero … KV（映像）の上。白のまま。ロゴは button で、heroEngine が
            click を拾って先頭へ戻す
     page … 紙の地の上。墨に反転し（.ink）、ロゴはトップへのリンクになる */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Mark } from '@/components/hero/Mark';
import { GLASS_MAP } from './glassMap';

type Variant = 'hero' | 'page';

export function SiteHeader({ variant = 'page' }: { variant?: Variant }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  useMenu(btnRef, menuRef);

  const hero = variant === 'hero';
  /* 下層のリンクは絶対パスにする。トップでは同じページ内の移動なので # のまま
     （#skip と同じ扱い。ここを / 付きにすると読み込み直しになる） */
  const products = hero ? '#after' : '/#after';

  return (
    <>
      {hero ? (
        <button id="brand" type="button" aria-label="はじめに戻る">
          <Mark />
        </button>
      ) : (
        <Link id="brand" className="ink" href="/" aria-label="トップへ">
          <Mark />
        </Link>
      )}

      {/* Liquid Glass のハンバーガー。丸いガラスの中に3本線。
          ガラスは backdrop-filter で下の SVG フィルター（#frosted）を通す。
          出典: codepen.io/Mikhail-Bespalov/pen/MYwrMNy。
          hover で feDisplacementMap の scale が 1→1.4 に伸びて、屈折が強まる */}
      <button id="menuBtn" ref={btnRef} className={hero ? undefined : 'ink'} aria-label="メニュー">
        <span /><span /><span />
      </button>
      <svg className="glass-defs" aria-hidden="true" focusable="false">
        <filter id="frosted" primitiveUnits="objectBoundingBox">
          <feImage href={GLASS_MAP} x="0" y="0" width="1" height="1" result="map" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="blur" in2="map" scale="1" xChannelSelector="R" yChannelSelector="G">
            <animate attributeName="scale" to="1.4" dur="0.3s" begin="menuBtn.mouseover" fill="freeze" />
            <animate attributeName="scale" to="1" dur="0.3s" begin="menuBtn.mouseout" fill="freeze" />
          </feDisplacementMap>
        </filter>
      </svg>

      <nav id="menu" ref={menuRef}>
        <ul>
          <li><a href={products}>PRODUCTS<small>プロダクト</small></a></li>
          <li><a href="https://good-order.jp" target="_blank" rel="noopener">GOOD ORDER<small>モバイルオーダー</small></a></li>
          <li><a href="https://good-review.jp" target="_blank" rel="noopener">GOOD REVIEW<small>レビューと満足度</small></a></li>
          <li><a href="/contact">CONTACT<small>お問い合わせ</small></a></li>
        </ul>
      </nav>
    </>
  );
}

/* メニューの開閉。開いている間は body に .menu-open が付く
   （ハンバーガーの変形と、映像区間のスワイプ抑止の解除に使う）*/
function useMenu(
  btnRef: React.RefObject<HTMLButtonElement | null>,
  menuRef: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const btn = btnRef.current, menu = menuRef.current;
    if (!btn || !menu) return;
    const toggle = () => document.body.classList.toggle('menu-open');
    const close = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'A') document.body.classList.remove('menu-open');
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
  }, [btnRef, menuRef]);
}
