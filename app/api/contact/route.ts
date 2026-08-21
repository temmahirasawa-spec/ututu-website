/* お問い合わせの受け口。フォームからの POST をメールにして送る。

   環境変数（Vercel の Project Settings → Environment Variables）
     RESEND_API_KEY  … Resend の API キー
     CONTACT_TO      … 受け取るアドレス。カンマ区切りで複数可
     CONTACT_FROM    … 差出人。**Resend で認証済みのドメインであること。**
                       未設定なら onboarding@resend.dev（試験用・自分宛にしか届かない）

   **鍵と宛先をコードに書かないこと。**この関数はサーバーでしか動かないが、
   値を直接書くとリポジトリが公開なのでそのまま漏れる。

   送信そのものは fetch で Resend の API を叩いている。SDK を入れないのは、
   このリポジトリが three.js 以外の依存を持たない方針のため。

   迷惑投稿よけは2つ。見えない入力欄（website）が埋まっていたら機械とみなし、
   **成功したふりをして捨てる**（弾いたと分かると作り直してくる）。
   もうひとつは同じ IP からの連投を短時間だけ止めるもの。 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX = { name: 100, company: 100, email: 200, message: 4000, topic: 60 };
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* 連投よけ。関数のインスタンスが生きているあいだだけ効く簡易なもの。
   **本気の対策ではない。**Vercel は実行環境を使い回さないことがあるので
   すり抜ける。厳密にやるなら Upstash などの外部の保存先が要る */
const RATE = { windowMs: 60_000, max: 3 };
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const seen = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  seen.push(now);
  hits.set(ip, seen);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < RATE.windowMs)) hits.delete(k);
  return seen.length > RATE.max;
}

const bad = (message: string, status: number) => NextResponse.json({ ok: false, message }, { status });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad('送信内容を読み取れませんでした。', 400);
  }

  const str = (k: string) => (typeof body[k] === 'string' ? (body[k] as string).trim() : '');
  const name = str('name'), email = str('email'), message = str('message');
  const company = str('company'), topic = str('topic');

  // 機械が埋めた見えない欄。成功と同じ返事をして、何もしない
  if (str('website')) return NextResponse.json({ ok: true });

  if (!name || name.length > MAX.name) return bad('お名前を確認してください。', 400);
  if (!email || !looksLikeEmail(email) || email.length > MAX.email) return bad('メールアドレスを確認してください。', 400);
  if (!message || message.length > MAX.message) return bad('お問い合わせ内容を確認してください。', 400);
  if (company.length > MAX.company || topic.length > MAX.topic) return bad('送信内容を確認してください。', 400);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return bad('送信が続いています。しばらく置いてからお試しください。', 429);

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO?.split(',').map((s) => s.trim()).filter(Boolean);
  if (!key || !to?.length) {
    /* 設定が入るまではここで止まる。**利用者に事情を見せないこと。**
       ログにだけ残し、画面には「送れなかった」とだけ伝える */
    console.error('お問い合わせを送れません：RESEND_API_KEY または CONTACT_TO が未設定です');
    return bad('ただいま送信を受け付けられません。お手数ですが時間をおいてお試しください。', 503);
  }

  const lines = [
    `お名前　　: ${name}`,
    `会社・店舗: ${company || '(未記入)'}`,
    `アドレス　: ${email}`,
    `ご用件　　: ${topic || '(未選択)'}`,
    '',
    message,
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'UTUTU <onboarding@resend.dev>',
        to,
        // 返信をそのまま送信者へ返せるようにする
        reply_to: email,
        subject: `[UTUTU] ${topic || 'お問い合わせ'} — ${name}`,
        text: lines,
      }),
    });
    if (!res.ok) {
      console.error('Resend からの応答が異常です', res.status, await res.text().catch(() => ''));
      return bad('送信できませんでした。お手数ですが時間をおいてお試しください。', 502);
    }
  } catch (err) {
    console.error('お問い合わせの送信に失敗しました', err);
    return bad('送信できませんでした。お手数ですが時間をおいてお試しください。', 502);
  }

  return NextResponse.json({ ok: true });
}
