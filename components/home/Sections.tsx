/* トップの各節（ヒーローより後ろ）。どの節も座標の世界の「パネル」（[data-panel]）。

   パネルの置き方（lib/world/world.ts）
     data-at      ひとつ前のパネルからのずらし。x は画面幅、y は画面高、z は奥行きの単位
     data-from    top ＝前のパネルの上端から測る（奥へ並べるとき）。既定は下端から
     data-transit 前のパネルからここへ渡る道のり（画面高の何倍のスクロールか）
     data-bulge   渡るあいだにカメラが引く量。map なら全体が収まるまで引く（地図）
     data-hold    読み終えてから次へ渡るまでの「間」
     data-ground  地の色（paper / ink / shu / order / review）
     data-mood    点のうねり：静脈, 塊, 粉, 速さ, 格子の波打ち
   点の印：[data-stamp]（形）、文字の避け場所：[data-clear]、灯る段落：[data-light]

   **書いてよいこと／いけないこと**（CLAUDE.md §0）
   - 特定の店名・ブランド名・運営会社名を出さない。実績は「期間を明記した過去形」で
   - 「自分たちの店」「直営」「この店が開発室」など、店を営んでいる前提の言い方をしない
   - 天真さんの経歴の社名は、プロフィールの全文の中にだけ置く */

import { Decode } from '@/components/site/Decode';
import { Arrow, ExtIcon } from '@/components/site/Header';
import { Mark } from '@/components/site/Mark';
import { PRODUCT_URL } from '@/components/site/productLinks';
import { TLink } from '@/components/site/TLink';
import { OrderPanel, ReviewPanel } from '@/components/products/Products';

function Label({ n, children }: { n: string; children: string }) {
  return <p className="lbl"><b>({n})</b><i aria-hidden="true" />{children}</p>;
}

/* ---------- (02) 宣言 ---------- */
/* 一語（文節）ずつ灯る。区切りは意味の切れ目で。[文字, 強調] */
const MANIFESTO: [string, boolean?][][] = [
  [['ひとつのサービスをつくるのに、'], ['大きなチームと、'], ['長い時間が'], ['必要だった。']],
  [['いまは、'], ['違います。']],
  [['事業を知る人間と、'], ['つくる手を持つ人間。'], ['AIを'], ['本当に使いこなせるなら、'], ['2人で足りる。', true]],
  [['私たちは'], ['その速さを、'], ['手を抜くためではなく、'], ['精度を上げるために', true], ['使います。']],
];

export function Manifesto() {
  return (
    <section
      id="why" className="pn mf" aria-labelledby="mf-h"
      data-panel="(02) WHY NOW" data-ground="ink" data-at="0.32,0.3,0" data-transit="1.05" data-bulge="0.55"
      data-mood="1.15,0.35,1,0.9,0.6"
    >
      <Label n="02">Why now</Label>
      <h2 id="mf-h" className="sr">私たちが2人でつくる理由</h2>
      <div className="mf-grid">
        <p className="mf-text" data-clear>
          {MANIFESTO.map((para, i) => (
            <span className="mf-p" key={i} data-light style={{ ['--n' as string]: para.length }}>
              {para.map(([w, hl], j) => (
                <span key={j} className={hl ? 'w hl' : 'w'} style={{ ['--i' as string]: j }}>{w}</span>
              ))}
            </span>
          ))}
        </p>
        <div className="mf-two" data-stamp="two" data-tint="" aria-hidden="true"><span>2</span></div>
      </div>
      <div className="mq" data-stamp="marquee" data-mode="marquee" data-fit="fill" data-e="0,0.03,0,0">
        <span className="mq-txt">Business × Craft × AI = Two</span>
      </div>
    </section>
  );
}

/* ---------- (03) 原則：見出し＋奥へ並ぶ3枚 ---------- */
export function How() {
  return (
    <section
      id="how" className="pn sec" aria-labelledby="how-h"
      data-panel="(03) HOW WE WORK" data-ground="paper" data-at="1.25,-0.5,-0.25" data-transit="1.1" data-bulge="0.7"
    >
      <Label n="03">How we work</Label>
      <div data-clear>
        <Decode className="ttl" lines={['AI, WITHOUT', 'SHORTCUTS.']} />
        <p className="ttl-jp" id="how-h">AIで、手を抜かない。</p>
      </div>
      <p className="sec-lead" data-clear>速さと精度は、両立できる。私たちの仕事の、3つの決まりごとです。<br />ここから先は、奥へ進みます。</p>
    </section>
  );
}

const CARDS = [
  {
    id: 'speed', en: 'Speed', jp: '資料より先に、動くもの。', ground: 'paper',
    body: '議論を重ねるより、まず触れる試作をつくる。試作と検証の回数が多いほど、仕上がりは良くなります。AIで縮めた時間は、その回数に回します。',
    stamp: { shape: 'speed', mode: 'speed', e: '0,0.45,0,0' }, mood: '0.85,0.4,1,2.6,0.75',
    at: '0,0.3,0', from: 'bottom', transit: '0.85', bulge: '0.15',
  },
  {
    id: 'precision', en: 'Precision', jp: '最後の1ピクセルは、人が決める。', ground: 'ink',
    body: 'AIが出したものを、そのまま出すことはしません。余白、文字の詰め、動きの間合い。品質を決める細部は、デザイナーの目でひとつずつ詰めていきます。',
    stamp: { shape: 'grid', mode: 'precision', e: '0,0,0,0' }, mood: '0.45,0.25,1,0.5,0.2',
    at: '0,0,-1.25', from: 'top', transit: '1.0', bulge: '0',
  },
  {
    id: 'business', en: 'Business', jp: 'つくって終わり、にしない。', ground: 'paper',
    body: '売上につながるか。現場が回るか。続けられるか。事業を自分の手で回してきた目線で、何をつくるか、何をつくらないかから一緒に決めます。',
    stamp: { shape: 'bars', mode: 'bars', e: '0,0,0,0' }, mood: '1,0.5,1,1,0.55',
    at: '0,0,-1.25', from: 'top', transit: '1.0', bulge: '0',
  },
] as const;

export function Cards() {
  return (
    <>
      {CARDS.map((c, i) => (
        <section
          key={c.id} id={c.id} className={`pn card card--${c.id}`} aria-labelledby={`${c.id}-h`}
          data-panel={`(03-${i + 1}) ${c.en.toUpperCase()}`} data-ground={c.ground} data-at={c.at} data-from={c.from}
          data-transit={c.transit} data-bulge={c.bulge} data-hold="0.6" data-mood={c.mood}
        >
          <div className="card-in">
            <p className="card-n">{String(i + 1).padStart(2, '0')} / 03 — How we work</p>
            <Decode as="p" className="card-en" lines={[c.en.toUpperCase()]} />
            <div className="card-body" data-clear>
              <h3 id={`${c.id}-h`}>{c.jp}</h3>
              <p>{c.body}</p>
            </div>
            <div className="card-fig" data-stamp={c.stamp.shape} data-mode={c.stamp.mode} data-e={c.stamp.e} data-fit={c.stamp.mode === 'speed' ? 'fill' : 'contain'} aria-hidden="true" />
          </div>
        </section>
      ))}
    </>
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
    <section
      id="services" className="pn sec sv" aria-labelledby="sv-h"
      data-panel="(04) SERVICES" data-ground="paper" data-at="-1.15,0.35,2.5" data-transit="1.25" data-bulge="0.35"
      data-mood="0.8,0.45,1,0.8,0.5"
    >
      <Label n="04">Services</Label>
      <div data-clear>
        <Decode className="ttl" lines={['LEAVE IT ALL', 'TO US.']} />
        <p className="ttl-jp" id="sv-h">まるごと、任せてください。</p>
      </div>
      <p className="sec-lead" data-clear>一部分だけでも、最初から最後まででも。最初の相談から、公開したあとの改善まで、同じ2人が担当します。</p>
      <ul className="sv-list">
        {SERVICES.map((s, i) => (
          <li className="sv-row" key={s.en} data-stamp="fill" data-mode="fill" data-on="hover" data-fit="fill" data-tint="">
            <span className="sv-n">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="sv-en" data-clear>{s.en}</h3>
            <div className="sv-txt" data-clear>
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
export function Work() {
  return (
    <section
      id="work" className="pn sec" aria-labelledby="wk-h"
      data-panel="(05) WORK" data-ground="paper" data-at="1.15,0.2,0" data-transit="0.95" data-bulge="0.3"
    >
      <Label n="05">Work</Label>
      <div data-clear>
        <Decode className="ttl" lines={['FIRST, WE BUILT', 'OUR OWN.']} />
        <p className="ttl-jp" id="wk-h">最初の作品は、自分たちのプロダクト。</p>
      </div>
      <p className="sec-lead" data-clear>
        店舗のためのプロダクト群「GOOD SERIES」。企画、ブランド、UI、開発、LP、映像まで、すべてを2人でつくっています。
        ここから先は、横へ進みます。
      </p>
      <p className="wk-next" aria-hidden="true"><span>GOOD ORDER</span><i /><span>GOOD REVIEW</span><i /><span>→</span></p>
    </section>
  );
}

export function Products() {
  return (
    <>
      <OrderPanel panel={{
        'data-panel': '(05-A) GOOD ORDER', 'data-ground': 'order', 'data-from': 'top', 'data-at': '1.08,0.06,0',
        'data-transit': '1.0', 'data-bulge': '0.12', 'data-hold': '0.35', 'data-mood': '0.7,0.4,0.9,1,0.5',
      }} />
      <ReviewPanel panel={{
        'data-panel': '(05-B) GOOD REVIEW', 'data-ground': 'review', 'data-from': 'top', 'data-at': '1.08,-0.06,0',
        'data-transit': '1.0', 'data-bulge': '0.12', 'data-hold': '0.35', 'data-mood': '0.7,0.4,0.9,1,0.5',
      }} />
    </>
  );
}

/* 数はすべて GOOD SERIES の実物から数えたもの。足したら、ここも直すこと。
   **確認待ち：**「全部2人で」と言い切ってよいか（外注した部分が無いか）は本人確認 */
const LEDGER: [number, string, string][] = [
  [2, 'Products', 'プロダクト'],
  [1, 'Brand system', 'ブランド'],
  [2, 'Landing pages', 'LP'],
  [2, 'Films', '映像'],
];

export function Ledger() {
  return (
    <section
      id="ledger" className="pn sec ld-pn" aria-labelledby="ld-h"
      data-panel="(05-C) BUILT BY TWO" data-ground="paper" data-at="-0.55,0.3,-0.2" data-transit="1.0" data-bulge="0.4"
    >
      <p className="lbl"><b>—</b><i aria-hidden="true" />Built by two</p>
      <div data-clear>
        <Decode className="ttl" lines={['BUILT BY TWO.']} />
        <p className="ttl-jp" id="ld-h">GOOD SERIES を、2人でつくりました。</p>
      </div>
      <div className="ld-wrap">
        <dl className="ld" data-clear>
          {LEDGER.map(([n, en, jp]) => (
            <div className="ld-i" key={en}>
              <dt><span>{en}</span><small>{jp}</small></dt>
              <dd data-count={n}>{String(n).padStart(2, '0')}</dd>
            </div>
          ))}
          <div className="ld-i ld-sum">
            <dt><span>People</span><small>つくった人数</small></dt>
            <dd data-count={2}>02</dd>
          </div>
        </dl>
        <div className="ld-two" data-stamp="two" data-tint="" aria-hidden="true" />
      </div>
    </section>
  );
}

/* ---------- (06) ふたり ---------- */
export function Team() {
  return (
    <section
      id="team" className="pn sec tm" aria-labelledby="tm-h"
      data-panel="(06) TEAM" data-ground="ink" data-at="-0.6,0.3,0" data-transit="1.1" data-bulge="0.65"
      data-mood="1.3,0.4,1,1,0.7"
    >
      <Label n="06">Team</Label>
      <div data-clear>
        <Decode className="ttl" lines={['THE OPERATOR', '& THE MAKER.']} />
        <p className="ttl-jp" id="tm-h">事業の人と、つくる人。</p>
      </div>
      <p className="sec-lead" data-clear>
        売れる理由を知る人と、使われる形を知る人。片方だけでは、いいサービスはできません。
        その2人が、最初から最後まで並んで走ります。
      </p>
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
    <article className="fd">
      <div className="fd-stage">
        <div className="fd-floor" data-stamp="floor" data-mode="floor" data-fit="fill" data-tint="" aria-hidden="true" />
        <div className="fd-ph" data-head={p.head} data-cm={p.cm} data-tap={p.tap} aria-hidden="true">
          <svg viewBox="0 0 64 64"><circle cx="32" cy="23" r="10" /><path d="M13 55 a19 19 0 0 1 38 0" /></svg>
        </div>
      </div>
      <div className="fd-txt" data-clear>
        <p className="fd-role" title={p.role}>{p.roleEn}</p>
        <h3 className="fd-name">{p.name}<small>{p.en}</small></h3>
        <p className="fd-ex">{p.ex}</p>
        <p className="fd-tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</p>
      </div>
      <button className="profile-btn" type="button" data-bio={p.bio}>Profile<i aria-hidden="true">+</i></button>
    </article>
  );
}

/* ---------- (07) 締め ---------- */
export function Contact() {
  return (
    <section
      id="contact-cta" className="pn sec ct" aria-labelledby="ct-h"
      data-panel="(07) CONTACT" data-ground="shu" data-at="0.45,0.45,0" data-transit="2.0" data-bulge="map"
      data-mood="1.7,0.7,1,1.3,0.95" data-hold="0.3"
    >
      <Label n="07">Contact</Label>
      <div data-clear>
        <Decode className="ttl ct-big" lines={["LET'S", 'BUILD.']} />
        <p className="ttl-jp" id="ct-h">まだ形になっていない相談ほど、歓迎です。</p>
      </div>
      <div className="ct-row">
        <p className="ct-lead" data-clear>事業のアイデア、困っている業務、作り直したいサービス。まずは話してみてください。</p>
        <div className="ct-btns" data-clear>
          <TLink className="btn" href="/company#contact">お問い合わせ<Arrow /></TLink>
          <TLink className="btn btn--line" href="/company">会社概要</TLink>
        </div>
      </div>
    </section>
  );
}

/* ---------- フッター（トップではパネル、/company ではふつうのフッター） ---------- */
export function Footer({ panel = false }: { panel?: boolean }) {
  const attrs = panel
    ? { 'data-panel': '(08) UTUTU', 'data-ground': 'ink', 'data-at': '0,0.12,0', 'data-transit': '0.75', 'data-bulge': '0.2', 'data-hold': '0' }
    : {};
  return (
    <footer className={`ft${panel ? ' pn' : ''}`} id="foot" {...attrs}>
      <div className="ft-cols" data-clear>
        <div>
          <p className="ft-h">Studio</p>
          <ul>
            <li><TLink href="/#services">できること</TLink></li>
            <li><TLink href="/#work">つくったもの</TLink></li>
            <li><TLink href="/#team">ふたり</TLink></li>
          </ul>
        </div>
        <div>
          <p className="ft-h">Company</p>
          <ul>
            <li><TLink href="/company">会社概要</TLink></li>
            <li><TLink href="/company#contact">お問い合わせ</TLink></li>
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
      <div className="ft-mark" data-stamp="mark" data-fit="fill" aria-hidden="true"><Mark /></div>
      <p className="ft-copy"><span>© 2026 UTUTU Inc.</span><span>Made by two, with AI.</span></p>
    </footer>
  );
}
