'use client';

/* プロフィールのモーダル。スマホは下からのシート、PCは中央のポップアップ
   （出し分けはCSS。globals.css の #bioModal を参照）。
   墨ゾーン（締めの周辺）でしか開かないので、色は墨で固定してある。 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { BIOS, type Bio } from './bios';

export function BioModal() {
  const [bio, setBio] = useState<Bio | null>(null);
  /* 閉じたときに、開いたボタンへフォーカスを戻す */
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setBio(null);
    opener.current?.focus();
    opener.current = null;
  }, []);

  /* 開閉の状態は body のクラスで持つ（CSSがそれを見て出し入れする）。
     開いた要素へフォーカスを戻すため、直前の activeElement を覚えておく */
  useEffect(() => {
    const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('.profile-btn'));
    const open = (e: Event) => {
      const key = (e.currentTarget as HTMLElement).dataset.bio;
      if (!key || !BIOS[key]) return;
      opener.current = document.activeElement as HTMLElement;
      setBio(BIOS[key]);
    };
    btns.forEach((b) => b.addEventListener('click', open));
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', esc);
    return () => {
      btns.forEach((b) => b.removeEventListener('click', open));
      window.removeEventListener('keydown', esc);
    };
  }, [close]);

  useEffect(() => {
    document.body.classList.toggle('bio-open', !!bio);
    if (bio) document.getElementById('bioClose')?.focus();
    return () => { document.body.classList.remove('bio-open'); };
  }, [bio]);

  return (
    <>
      <div id="bioVeil" onClick={close} />
      <div id="bioModal" role="dialog" aria-modal="true" aria-label="プロフィール">
        <div className="grip" aria-hidden="true" />
        <button id="bioClose" type="button" aria-label="閉じる" onClick={close}>✕</button>
        <p className="bm-role">{bio?.role}</p>
        <p className="bm-name">{bio?.name}</p>
        <p className="bm-en">{bio?.en}</p>
        <p className="bm-bio">{bio?.bio}</p>
      </div>
    </>
  );
}
