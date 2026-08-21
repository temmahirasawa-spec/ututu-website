'use client';

/* お問い合わせフォーム。

   送信は /api/contact（Route Handler）へ投げる。**メールの宛先も鍵も
   ここには置かない。**ブラウザに配られるので、サーバー側の環境変数で持つ。

   検証はブラウザとサーバーの両方でやる。ブラウザ側は打ち間違いを
   その場で知らせるためのもので、**通す/通さないの判断はサーバー側が持つ。** */

import { useRef, useState } from 'react';

const TOPICS = [
  '導入のご相談',
  'GOOD ORDER について',
  'GOOD REVIEW について',
  '取材・協業のご相談',
  'その他',
] as const;

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

/* サーバー側（app/api/contact/route.ts）と同じ条件を使う。
   片方だけ変えると、通ったのに弾かれる／その逆が起きる */
const MAX = { name: 100, company: 100, email: 200, message: 4000 };
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function validate(f: FormData): Errors {
  const e: Errors = {};
  const name = String(f.get('name') ?? '').trim();
  const email = String(f.get('email') ?? '').trim();
  const message = String(f.get('message') ?? '').trim();
  if (!name) e.name = 'お名前を入力してください。';
  else if (name.length > MAX.name) e.name = `お名前は${MAX.name}文字以内で入力してください。`;
  if (!email) e.email = 'メールアドレスを入力してください。';
  else if (!looksLikeEmail(email)) e.email = 'メールアドレスの形式を確認してください。';
  else if (email.length > MAX.email) e.email = `メールアドレスは${MAX.email}文字以内で入力してください。`;
  if (!message) e.message = 'お問い合わせ内容を入力してください。';
  else if (message.length > MAX.message) e.message = `お問い合わせ内容は${MAX.message}文字以内で入力してください。`;
  return e;
}

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errs, setErrs] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [failed, setFailed] = useState<string | null>(null);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (state === 'sending') return;
    const form = ev.currentTarget;
    const data = new FormData(form);

    const found = validate(data);
    setErrs(found);
    if (Object.keys(found).length) {
      /* 最初の不備へ移す。**押した瞬間に画面が変わらないと、
         下のほうの不備は気づかれない** */
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setState('sending');
    setFailed(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || '送信できませんでした。');
      }
      setState('done');
    } catch (err) {
      setState('idle');
      setFailed(err instanceof Error ? err.message : '送信できませんでした。');
    }
  }

  if (state === 'done') {
    return (
      <div className="fm-done" role="status">
        <h2>お送りしました。</h2>
        <p>ご連絡ありがとうございます。内容を確認のうえ、数営業日のうちにご返信します。</p>
        <p>お急ぎの場合や、しばらく返信が届かない場合は、恐れ入りますがもう一度お送りください。</p>
      </div>
    );
  }

  return (
    <form className="fm" ref={formRef} onSubmit={onSubmit} noValidate>
      <div className="fm-row">
        <label htmlFor="f-name">お名前<span className="req">必須</span></label>
        <input id="f-name" name="name" type="text" autoComplete="name" maxLength={MAX.name}
          aria-invalid={!!errs.name} aria-describedby={errs.name ? 'e-name' : undefined} />
        {errs.name && <p className="fm-err" id="e-name">{errs.name}</p>}
      </div>

      <div className="fm-row">
        <label htmlFor="f-company">会社名・店舗名</label>
        <input id="f-company" name="company" type="text" autoComplete="organization" maxLength={MAX.company} />
      </div>

      <div className="fm-row">
        <label htmlFor="f-email">メールアドレス<span className="req">必須</span></label>
        <input id="f-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={MAX.email}
          aria-invalid={!!errs.email} aria-describedby={errs.email ? 'e-email' : undefined} />
        {errs.email && <p className="fm-err" id="e-email">{errs.email}</p>}
      </div>

      <div className="fm-row">
        <label htmlFor="f-topic">ご用件</label>
        <select id="f-topic" name="topic" defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="fm-row">
        <label htmlFor="f-message">お問い合わせ内容<span className="req">必須</span></label>
        <textarea id="f-message" name="message" maxLength={MAX.message}
          aria-invalid={!!errs.message} aria-describedby={errs.message ? 'e-message' : undefined} />
        {errs.message && <p className="fm-err" id="e-message">{errs.message}</p>}
      </div>

      {/* 迷惑投稿よけ。人には見えない場所にあるので、埋まっていたら機械とみなす */}
      <div className="fm-hp" aria-hidden="true">
        <label htmlFor="f-url">こちらは入力しないでください</label>
        <input id="f-url" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="fm-send" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? '送信しています…' : '送信する'}
      </button>

      {failed && <p className="fm-msg ng" role="status">{failed}</p>}

      <p className="fm-privacy">
        いただいた内容は、ご連絡と検討のためだけに使います。第三者へ渡すことはありません。
      </p>
    </form>
  );
}
