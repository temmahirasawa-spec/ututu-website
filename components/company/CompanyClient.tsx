'use client';

/* 会社概要＋お問い合わせ（/company）。2026-10 のリニューアルで、トップと同じ設計言語に揃えた
   （旧版の「品書き・伝票」の見立ては、スタジオとしての打ち出しに合わないので撤去）。
   CSS は company.css。現れ方は components/home/reveal.ts を共用。 */

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { Footer } from '@/components/home/Sections';
import { Rise } from '@/components/home/Rise';
import { startReveal } from '@/components/home/reveal';
import { Arrow } from '@/components/site/Header';
import '@/components/home/home.css';
import './company.css';

/* 会社概要の中身。**確定していない項目はここに足さないこと。**
   所在地は登記のまま（移転は弁護士の確認を経てから。登記が変わったら更新する）。
   事業内容は 2026-10-01 にスタジオの打ち出しに合わせて書き換えた（定款の目的と食い違わないか要確認） */
const ROWS: [string, string, string][] = [
  ['Name', '商号', '株式会社UTUTU'],
  ['Founded', '創業', '2026年9月7日'],
  ['Representatives', '共同代表', '板倉 洋輔　／　平澤 天真'],
  ['Address', '所在地', '〒650-0023　兵庫県神戸市中央区栄町通1-1-9'],
  ['Business', '事業内容', 'デジタルプロダクトの企画・デザイン・開発／店舗向けソフトウェア「GOOD SERIES」の提供'],
  ['Products', 'プロダクト', 'GOOD ORDER ／ GOOD REVIEW'],
];

const KINDS = ['制作・開発のご相談', 'GOOD SERIES の導入', '取材・掲載', 'その他'] as const;

export function CompanyClient() {
  useEffect(() => startReveal(), []);

  return (
    <>
      <main className="cp">
        <section className="cp-sec" aria-labelledby="cp-h">
          <p className="lbl rv"><b>(01)</b><i aria-hidden="true" />Company</p>
          <Rise as="h1" className="cp-h" lines={['会社概要']} />
          <dl className="cp-dl">
            {ROWS.map(([en, jp, v], i) => (
              <div className="cp-row rv" key={en} style={{ ['--d' as string]: `${i * 0.06}s` }}>
                <dt><span>{en}</span>{jp}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="cp-sec cp-contact" id="contact" aria-labelledby="ct-form-h">
          <p className="lbl rv"><b>(02)</b><i aria-hidden="true" />Contact</p>
          <div className="cp-contact-grid">
            <div>
              <Rise className="cp-h" lines={['お問い合わせ']} />
              <p className="cp-lead rv">
                まだ形になっていない相談ほど、歓迎です。<br />
                制作・開発のご相談も、GOOD SERIES の導入も、取材も。内容を確認して、折り返しご連絡します。
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ---- 問い合わせの欄 ---- */
function ContactForm() {
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error' | 'unconfigured'>('idle');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const data = {
      kind,
      name: (f.elements.namedItem('name') as HTMLInputElement).value.trim(),
      org: (f.elements.namedItem('org') as HTMLInputElement).value.trim(),
      email: (f.elements.namedItem('email') as HTMLInputElement).value.trim(),
      message: (f.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
      /* 蜜壺。人には見えない欄で、埋まっていたら機械の投稿 */
      website: (f.elements.namedItem('website') as HTMLInputElement).value,
    };
    setState('sending');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (r.status === 503) { setState('unconfigured'); return; }
      if (!r.ok) throw new Error(String(r.status));
      setState('done');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="cp-form cp-done" role="status">
        <p className="cp-done-n">Received</p>
        <h3>お問い合わせを受け付けました。</h3>
        <p>内容を確認して、折り返しご連絡します。しばらくお待ちください。</p>
        <Link className="btn btn--line" href="/">トップへ戻る</Link>
      </div>
    );
  }

  return (
    <form className="cp-form rv" style={{ ['--d' as string]: '.12s' }} onSubmit={submit}>
      <fieldset className="cp-kinds">
        <legend>ご用件</legend>
        {KINDS.map((k) => (
          <span className="cp-kind" key={k}>
            <input type="radio" id={`kind-${k}`} name="kind" value={k}
              checked={kind === k} onChange={() => setKind(k)} />
            <label htmlFor={`kind-${k}`}>{k}</label>
          </span>
        ))}
      </fieldset>

      <div className="cp-field">
        <label htmlFor="cf-name">お名前</label>
        <input id="cf-name" name="name" type="text" required autoComplete="name" placeholder="山田 太郎" />
      </div>
      <div className="cp-field">
        <label htmlFor="cf-org">会社・店舗名<i>任意</i></label>
        <input id="cf-org" name="org" type="text" autoComplete="organization" placeholder="株式会社〇〇" />
      </div>
      <div className="cp-field">
        <label htmlFor="cf-email">メールアドレス</label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="cp-field">
        <label htmlFor="cf-msg">ご相談の内容</label>
        <textarea id="cf-msg" name="message" required placeholder="つくりたいもの、困っていること、聞いてみたいこと。箇条書きでも構いません。" />
      </div>

      {/* 蜜壺。CSSで隠すのではなく画面外へ（display:none だと埋めない機械がある） */}
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />

      <div className="cp-send">
        <button className="btn btn--shu" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? '送信中…' : '送信する'}<Arrow />
        </button>
        <p className="cp-form-note">いただいた内容は、お返事のためだけに使います。</p>
      </div>

      {state === 'error' && (
        <p className="cp-error" role="alert">送信できませんでした。時間をおいて、もう一度お試しください。</p>
      )}
      {state === 'unconfigured' && (
        <p className="cp-error" role="alert">
          送信の受け口を準備中です。
          {process.env.NEXT_PUBLIC_CONTACT_EMAIL
            ? <>お手数ですが <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a> へお送りください。</>
            : 'お手数ですが、時間をおいてお試しください。'}
        </p>
      )}
    </form>
  );
}
