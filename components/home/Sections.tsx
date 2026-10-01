/* トップの各節（ヒーローより下）。マークアップだけで、動きは
   reveal.ts（現れる・数える）と CSS のスクロール連動（点灯・幅・積み重なり）。
   CSS は home.css。

   **書いてよいこと／いけないこと（2026-10-01 時点）**
   - 特定の店名・ブランド名・運営会社名を出さない。実績は「期間を明記した過去形」で
   - 「自分たちの店」「直営」「この店が開発室」など、店を営んでいる前提の言い方をしない
   - 天真さんの経歴の社名（サイバーエージェント／Adobe）は、プロフィールの全文の中にだけ置く。
     見出しや一言には出さない（本人判断：前面に出しすぎない） */

import Link from 'next/link';
import { Arrow, ExtIcon } from '@/components/site/Header';
import { Mark } from '@/components/site/Mark';
import { PRODUCT_URL } from '@/components/site/productLinks';
import { Products } from '@/components/products/Products';
import { Rise } from './Rise';

function Label({ n, children }: { n: string; children: string }) {
  return <p className="lbl rv"><b>({n})</b><i aria-hidden="true" />{children}</p>;
}

/* ---------- (02) 宣言 ---------- */
/* 一語ずつ灯る。区切りは意味の切れ目で。[文字, 強調] */
const MANIFESTO: [string, boolean?][][] = [
  [['ひとつのサービスをつくるのに、'], ['大きなチームと、'], ['長い時間が'], ['必要だった。']],
  [['いまは、'], ['違います。']],
  [['事業を知る人間と、'], ['つくる手を持つ人間。'], ['AIを'], ['本当に使いこなせるなら、'], ['2人で足りる。', true]],
  [['私たちは'], ['その速さを、'], ['手を抜くためではなく、'], ['精度を上げるために', true], ['使います。']],
];

export function Manifesto() {
  return (
    <section className="mf" id="why" aria-labelledby="mf-h">
      <div className="mf-in">
        <Label n="02">Why now</Label>
        <h2 id="mf-h" className="sr">私たちが2人でつくる理由</h2>
        <p className="mf-text">
          {MANIFESTO.map((para, i) => (
            <span className="mf-p" key={i}>
              {para.map(([w, hl], j) => <span key={j} className={hl ? 'w hl' : 'w'}>{w}</span>)}
            </span>
          ))}
        </p>
      </div>
      <div className="mq" aria-hidden="true">
        <div className="mq-row">
          {[0, 1].map((k) => (
            <span className="mq-set" key={k}>
              <span>Business</span><b>×</b><span>Craft</span><b>×</b><span>AI</span><b>=</b><span className="mq-two">Two</span><b>/</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- (03) 原則 ---------- */
const PRINCIPLES = [
  {
    en: 'Speed', jp: '資料より先に、動くもの。',
    body: '議論を重ねるより、まず触れる試作をつくる。試作と検証の回数が多いほど、仕上がりは良くなります。AIで縮めた時間は、その回数に回します。',
    motif: 'speed',
  },
  {
    en: 'Precision', jp: '最後の1ピクセルは、人が決める。',
    body: 'AIが出したものを、そのまま出すことはしません。余白、文字の詰め、動きの間合い。品質を決める細部は、デザイナーの目でひとつずつ詰めていきます。',
    motif: 'precision',
  },
  {
    en: 'Business', jp: 'つくって終わり、にしない。',
    body: '売上につながるか。現場が回るか。続けられるか。事業を自分の手で回してきた目線で、何をつくるか、何をつくらないかから一緒に決めます。',
    motif: 'business',
  },
] as const;

export function Principles() {
  return (
    <section className="pr" id="how" aria-labelledby="pr-h">
      <div className="pr-head">
        <Label n="03">How we work</Label>
        <Rise className="sec-h" lines={['AIで、', '手を抜かない。']} />
        <p className="sec-lead rv">速さと精度は、両立できる。私たちの仕事の、3つの決まりごとです。</p>
      </div>
      <ol className="pr-stack">
        {PRINCIPLES.map((p, i) => (
          <li className={`pr-card pr-card--${i + 1}`} key={p.en} style={{ ['--i' as string]: i }}>
            <div className="pr-top">
              <span className="pr-n">{String(i + 1).padStart(2, '0')} / 03</span>
              <Motif kind={p.motif} />
            </div>
            <p className="pr-en" aria-hidden="true">{p.en}</p>
            <div className="pr-body">
              <h3>{p.jp}</h3>
              <p>{p.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* 原則ごとの小さな図。動きは CSS（home.css の .mo-*） */
function Motif({ kind }: { kind: string }) {
  if (kind === 'speed') {
    return (
      <svg className="mo mo-speed" viewBox="0 0 160 80" aria-hidden="true">
        {[10, 24, 38, 52, 66].map((y, i) => <line key={y} x1="8" x2={150 - i * 14} y1={y} y2={y} style={{ ['--k' as string]: i }} />)}
      </svg>
    );
  }
  if (kind === 'precision') {
    return (
      <svg className="mo mo-prec" viewBox="0 0 160 80" aria-hidden="true">
        <rect x="52" y="14" width="56" height="52" />
        <line x1="80" x2="80" y1="2" y2="78" /><line x1="40" x2="120" y1="40" y2="40" />
        <circle cx="80" cy="40" r="7" />
        <text x="114" y="12">+1px</text>
      </svg>
    );
  }
  return (
    <svg className="mo mo-biz" viewBox="0 0 160 80" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={14 + i * 28} y={70 - (i + 1) * 11} width="16" height={(i + 1) * 11} style={{ ['--k' as string]: i }} />)}
      <polyline points="22,52 50,44 78,36 106,22 134,8" />
    </svg>
  );
}

/* ---------- (04) できること ---------- */
const SERVICES = [
  { en: 'Strategy', jp: '事業設計', body: '何をつくるか、何をつくらないか。事業と現場の両方から、最初の設計図を引きます。', tags: ['企画', '要件整理', '業務設計', 'グロース'] },
  { en: 'Design', jp: 'UI/UX・ブランド', body: '使う人が迷わない画面と、覚えてもらえるブランドを。', tags: ['体験設計', 'UIデザイン', 'ロゴ・VI', 'デザインシステム'] },
  { en: 'Engineering', jp: 'プロダクト開発', body: '試作から本番まで。生成AIを組み込んだ仕組みも、つくれます。', tags: ['Webアプリ', 'モバイルオーダー', '業務ツール', 'AIの組み込み'] },
  { en: 'Film & Web', jp: '映像・Webサイト', body: '伝えるところまで、同じ手で。', tags: ['プロモーション映像', 'SNS広告', 'LP', 'コーポレートサイト'] },
];

export function Services() {
  return (
    <section className="sv" id="services" aria-labelledby="sv-h">
      <div className="sv-head">
        <Label n="04">Services</Label>
        <Rise className="sec-h" lines={['まるごと、', '任せてください。']} />
        <p className="sec-lead rv">一部分だけでも、最初から最後まででも。最初の相談から、公開したあとの改善まで、同じ2人が担当します。</p>
      </div>
      <ul className="sv-list">
        {SERVICES.map((s, i) => (
          <li className="sv-row rv" key={s.en}>
            <span className="sv-n">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="sv-en">{s.en}</h3>
            <div className="sv-txt">
              <p className="sv-jp">{s.jp}</p>
              <p className="sv-body">{s.body}</p>
              <p className="sv-tags">{s.tags.map((t) => <span key={t}>{t}</span>)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- (05) つくったもの ---------- */
/* 数はすべて GOOD SERIES の実物から数えたもの。足したら、ここも直すこと。
   **確認待ち：**「全部2人で」と言い切ってよいか（外注した部分が無いか）は本人確認 */
const LEDGER: [number, string, string][] = [
  [2, 'Products', 'プロダクト'],
  [1, 'Brand system', 'ブランド'],
  [2, 'Landing pages', 'LP'],
  [2, 'Films', '映像'],
];

export function Work() {
  return (
    <section className="wk" id="work" aria-labelledby="wk-h">
      <div className="wk-head">
        <Label n="05">Work</Label>
        <Rise className="sec-h" lines={['最初の作品は、', '自分たちのプロダクト。']} />
        <p className="sec-lead rv">
          店舗のためのプロダクト群「GOOD SERIES」。企画、ブランド、UI、開発、LP、映像まで、すべてを2人でつくっています。
        </p>
      </div>
      <Products />
      <div className="wk-ledger">
        <p className="lbl rv"><b>—</b><i aria-hidden="true" />Built by two</p>
        <dl className="ld">
          {LEDGER.map(([n, en, jp]) => (
            <div className="ld-i rv" key={en}>
              <dt><span>{en}</span><small>{jp}</small></dt>
              <dd data-count={n}>{String(n).padStart(2, '0')}</dd>
            </div>
          ))}
          <div className="ld-i ld-sum rv">
            <dt><span>People</span><small>つくった人数</small></dt>
            <dd data-count={2}>02</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/* ---------- (06) ふたり ---------- */
/* 3Dアバターの枠（.fd-ph）。headViewer.js がこの枠に canvas を差し込む。
   data-cm は身長、data-tap はタップの反応（CLAUDE.md「Founders のアバター」） */
export function Team() {
  return (
    <section className="tm" id="team" aria-labelledby="tm-h">
      <div className="tm-head">
        <Label n="06">Team</Label>
        <Rise className="sec-h" lines={['事業の人と、', 'つくる人。']} />
        <p className="sec-lead rv">
          売れる理由を知る人と、使われる形を知る人。片方だけでは、いいサービスはできません。
          その2人が、最初から最後まで並んで走ります。
        </p>
      </div>
      <div className="tm-duo">
        <Person
          head="yosuke" cm={173} tap="stumble" bio="yosuke"
          roleEn="Co-founder / Business Producer" role="共同創業者 / ビジネスプロデューサー"
          name="板倉 洋輔" en="Yosuke Itakura"
          ex="神戸・阪神間で10年以上、飲食店の経営と出店に携わってきた。現場と数字の両方から、事業を設計する。"
          tags={['事業設計', '店舗運営', '出店', '要件定義']}
        />
        <span className="tm-x" aria-hidden="true">×</span>
        <Person
          head="temma" cm={160} tap="startle" bio="temma"
          roleEn="Co-founder / Creative Director" role="共同創業者 / クリエイティブディレクター"
          name="平澤 天真" en="Temma Hirasawa"
          ex="グラフィックからUI、映像まで。大規模サービスのUI/UX設計を経て、GOOD SERIES の設計と開発を統括する。"
          tags={['UI/UX', 'ブランド', '開発', '映像']}
        />
      </div>
    </section>
  );
}

function Person(p: {
  head: string; cm: number; tap: string; bio: string; roleEn: string; role: string;
  name: string; en: string; ex: string; tags: string[];
}) {
  return (
    <article className="fd rv">
      <div className="fd-ph" data-head={p.head} data-cm={p.cm} data-tap={p.tap} aria-hidden="true">
        <svg viewBox="0 0 64 64"><circle cx="32" cy="23" r="10" /><path d="M13 55 a19 19 0 0 1 38 0" /></svg>
      </div>
      <p className="fd-role" title={p.role}>{p.roleEn}</p>
      <h3 className="fd-name">{p.name}<small>{p.en}</small></h3>
      <p className="fd-ex">{p.ex}</p>
      <p className="fd-tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</p>
      <button className="profile-btn" type="button" data-bio={p.bio}>Profile<i aria-hidden="true">+</i></button>
    </article>
  );
}

/* ---------- (07) 締め ---------- */
export function Contact() {
  return (
    <section className="ct" id="contact-cta" aria-labelledby="ct-h">
      <Label n="07">Contact</Label>
      <h2 id="ct-h" className="ct-big" aria-label="Let's build.">
        <span className="ct-l1">Let&apos;s</span>
        <span className="ct-l2">build.</span>
      </h2>
      <div className="ct-row">
        <p className="ct-lead rv">
          まだ形になっていない相談ほど、歓迎です。<br />
          事業のアイデア、困っている業務、作り直したいサービス。まずは話してみてください。
        </p>
        <div className="ct-btns rv">
          <Link className="btn" href="/company#contact">お問い合わせ<Arrow /></Link>
          <Link className="btn btn--line" href="/company">会社概要</Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- フッター（トップと /company で共通） ---------- */
export function Footer() {
  return (
    <footer className="ft">
      <div className="ft-cols">
        <div>
          <p className="ft-h">Studio</p>
          <ul>
            <li><Link href="/#services">できること</Link></li>
            <li><Link href="/#work">つくったもの</Link></li>
            <li><Link href="/#team">ふたり</Link></li>
          </ul>
        </div>
        <div>
          <p className="ft-h">Company</p>
          <ul>
            <li><Link href="/company">会社概要</Link></li>
            <li><Link href="/company#contact">お問い合わせ</Link></li>
          </ul>
        </div>
        <div>
          <p className="ft-h">Products</p>
          <ul>
            <li><a href={PRODUCT_URL.order} target="_blank" rel="noopener">GOOD ORDER<ExtIcon /></a></li>
            <li><a href={PRODUCT_URL.review} target="_blank" rel="noopener">GOOD REVIEW<ExtIcon /></a></li>
          </ul>
        </div>
        <p className="ft-note">株式会社UTUTU<br />Creative Studio for DX<br />Kobe, Japan</p>
      </div>
      <div className="ft-mark" aria-hidden="true"><Mark /></div>
      <p className="ft-copy"><span>© 2026 UTUTU Inc.</span><span>Made by two, with AI.</span></p>
    </footer>
  );
}
