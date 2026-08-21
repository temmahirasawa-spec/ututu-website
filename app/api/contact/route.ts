/* お問い合わせの受け口。Resend でメールを1通送るだけ。
   実行は東京リージョン（vercel.json の regions: hnd1）。

   必要な環境変数（Vercel の Project Settings → Environment Variables）
     RESEND_API_KEY … Resend のAPIキー
     CONTACT_TO     … 受け取るメールアドレス
     CONTACT_FROM   … 差出人（任意）。未設定なら Resend の onboarding アドレス。
                      独自ドメインを Resend に登録したら差し替える

   **キー未設定のときは 503 を返す。**フロントはこれを受けて
   「準備中」の案内に切り替える（黙って握りつぶさない）。 */

const RESEND_URL = 'https://api.resend.com/emails';

export async function POST(req: Request) {
  let body: {
    kind?: string; name?: string; org?: string;
    email?: string; message?: string; website?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad-json' }, { status: 400 });
  }

  /* 蜜壺が埋まっていたら機械の投稿。成功したふりをして捨てる
     （エラーを返すと、機械が学習して埋めなくなる） */
  if (body.website) return Response.json({ ok: true });

  const kind = (body.kind || '').slice(0, 40);
  const name = (body.name || '').trim().slice(0, 120);
  const org = (body.org || '').trim().slice(0, 200);
  const email = (body.email || '').trim().slice(0, 254);
  const message = (body.message || '').trim().slice(0, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    return Response.json({ error: 'not-configured' }, { status: 503 });
  }

  const text = [
    `ご用件　：${kind || '（未選択）'}`,
    `お名前　：${name}`,
    `店舗など：${org || '（未記入）'}`,
    `メール　：${email}`,
    '',
    '――― ご注文の内容 ―――',
    message,
  ].join('\n');

  const r = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'UTUTU <onboarding@resend.dev>',
      to: [to],
      reply_to: email,
      subject: `【${kind || 'お問い合わせ'}】${name} 様より`,
      text,
    }),
  });

  if (!r.ok) {
    console.error('Resend への送信に失敗:', r.status, await r.text().catch(() => ''));
    return Response.json({ error: 'send-failed' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
