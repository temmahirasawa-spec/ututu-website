'use client';

/* 会社概要＋お問い合わせ。見立ては「お品書き」と「注文伝票」。
   会社の情報はメニューとして読ませ、問い合わせは注文として受ける。
   CSSは company.css。数字や文言の確定待ちは CLAUDE.md の「残っている作業」参照。 */

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Mark } from '@/components/hero/Mark';
import './company.css';

/* お品書きの中身。**確定していない項目はここに足さないこと。**
   所在地は登記の公開待ちで、いまは載せていない */
const MENU: [string, string][] = [
  ['商号', '株式会社UTUTU'],
  ['創業', '2026年'],
  ['共同代表', '板倉 洋輔　／　平澤 天真'],
  ['事業内容', '店舗向けソフトウェアの企画・開発・提供'],
  ['プロダクト', 'GOOD ORDER ／ GOOD REVIEW'],
  ['検証の場', '直営4ブランド（YORKYS BRUNCH ほか）'],
];

const KINDS = ['導入の相談', '取材・掲載', '協業のお誘い', 'その他'] as const;

export function CompanyClient() {
  /* 静かに現れる。トップの .rv と同じ動きだが、初期化はこのページで完結させる */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.cp-rv, .cp-menu'));
    /* ?reveal を付けると全部開いた状態になる。スクリーンショット確認用
       （ヘッドレスでは IntersectionObserver が凍るため） */
    if (location.search.includes('reveal')
      || matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="cp">
      <header className="cp-top">
        <Link className="cp-back" href="/"><i />TOP</Link>
        <Link className="cp-mark" href="/" aria-label="トップへ戻る"><Mark title="UTUTU" /></Link>
        <span className="sp" aria-hidden="true" />
      </header>

      {/* ---- お品書き ---- */}
      <main className="cp-in">
        <p className="cp-eyebrow cp-rv">Company</p>
        <h1 className="cp-rv" style={{ ['--d' as string]: '.06s' }}>お品書き</h1>
        <p className="cp-lead cp-rv" style={{ ['--d' as string]: '.12s' }}>
          株式会社UTUTUの会社概要を、一枚にまとめました。
        </p>

        <section className="cp-menu" aria-label="会社概要">
          <div className="cp-menu-in">
            <p className="cp-menu-title">御品書</p>
            <p className="cp-menu-sub">COMPANY PROFILE</p>
            <dl>
              {MENU.map(([k, v], i) => (
                <div className="cp-row" key={k} style={{ ['--d' as string]: `${0.15 + i * 0.14}s` }}>
                  <dt>{k}</dt>
                  <span className="lead" aria-hidden="true" />
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="cp-menu-note">※ お品書きは、予告なく増えます。</p>
          </div>
        </section>

        {/* ---- 注文伝票 ---- */}
        <section className="cp-contact" id="contact" aria-label="お問い合わせ">
          <p className="cp-eyebrow cp-rv">Contact</p>
          <h2 className="cp-rv" style={{ ['--d' as string]: '.06s' }}>ご注文は、こちらから。</h2>
          <p className="cp-lead cp-rv" style={{ ['--d' as string]: '.12s' }}>
            導入のご相談も、取材も、「まずは話だけ」も歓迎です。
          </p>
          <ContactSlip />
        </section>
      </main>

      <footer className="cp-foot">
        <span>© UTUTU Inc.</span>
        <span><Link href="/">トップへ戻る</Link></span>
      </footer>
    </div>
  );
}

/* ---- 伝票そのもの ---- */
function ContactSlip() {
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error' | 'unconfigured'>('idle');
  const [slipNo, setSlipNo] = useState('—');
  const formRef = useRef<HTMLFormElement>(null);

  /* 伝票番号は飾り。**サーバーで作らないこと。**描画のたびに変わる値を
     SSRに含めると、水和で食い違って警告が出る。載せるのはマウント後 */
  useEffect(() => {
    /* rAF ではなくタイマーで。裏で開いたタブは rAF が凍り、
       表に出すまで「—」のままになる */
    const id = setTimeout(() => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      setSlipNo(`No. ${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(Math.floor(Math.random() * 100))}`);
    }, 0);
    return () => clearTimeout(id);
  }, []);

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
      <div className="cp-slip cp-rv in">
        <div className="cp-done" role="status">
          <span className="cp-stamp" aria-hidden="true">受付済</span>
          <h3>ご注文、承りました。</h3>
          <p>内容を確認して、折り返しご連絡します。<br />しばらくお待ちください。</p>
        </div>
      </div>
    );
  }

  return (
    <form className="cp-slip cp-rv" style={{ ['--d' as string]: '.18s' }} ref={formRef} onSubmit={submit}>
      <div className="cp-slip-head">
        <b>ご注文伝票</b>
        <span>{slipNo}</span>
      </div>

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
        <label htmlFor="cf-org">店舗・会社名<i>任意</i></label>
        <input id="cf-org" name="org" type="text" autoComplete="organization" placeholder="〇〇カフェ" />
      </div>
      <div className="cp-field">
        <label htmlFor="cf-email">メールアドレス</label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="cp-field">
        <label htmlFor="cf-msg">ご注文の内容</label>
        <textarea id="cf-msg" name="message" required placeholder="お店のこと、いま困っていること、聞いてみたいこと。なんでもどうぞ。" />
      </div>

      {/* 蜜壺。CSSで隠すのではなく画面外へ（display:none だと埋めない機械がある） */}
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />

      <div className="cp-total">
        <b>合計</b>
        <span className="lead" aria-hidden="true" />
        <span>ご相談 一式 …… ¥0</span>
      </div>

      <button className="cp-submit" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? '送信中…' : 'この内容で注文する'}
      </button>

      {state === 'error' && (
        <p className="cp-error">送信できませんでした。時間をおいて、もう一度お試しください。</p>
      )}
      {state === 'unconfigured' && (
        <p className="cp-error">
          送信の受け口を準備中です。
          {process.env.NEXT_PUBLIC_CONTACT_EMAIL
            ? <>お手数ですが <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a> へお送りください。</>
            : 'お手数ですが、時間をおいてお試しください。'}
        </p>
      )}
      <p className="cp-form-note">いただいた内容は、お返事のためだけに使います。</p>
    </form>
  );
}
