/* トップの各節（ヒーローより後ろ）。どの節も座標の世界の「パネル」（[data-panel]）。

   並びは「誰が・何を → 何を頼めるか → 実績 → 誰がやるか → 思い（宣言・原則） → 次の一歩」。
   **思いやコンセプトは最後に置く**（2026-10-02 本人判断：最初に訴えると、訪れた人は困って独りよがりになる）。
   何をする会社かは、ヒーローの次の「できること」で具体的に見せる。

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
   - 飲食ブランドは「立ち上げた」事実を過去形で。いまも運営しているように読める書き方はしない
   - 「2人で」を押し出しすぎない（本人判断）。打ち出しはビジネス×クリエイティブの掛け算
   - 天真さんの経歴の社名は、プロフィールの全文の中にだけ置く */

/* eslint-disable @next/next/no-img-element -- 実績の写真は枠に合わせて object-fit で切る。width / height は必ず付ける */

import { Decode } from '@/components/site/Decode';
import { Arrow, ExtIcon } from '@/components/site/Header';
import { Mark } from '@/components/site/Mark';
import { PRODUCT_URL } from '@/components/site/productLinks';
import { TLink } from '@/components/site/TLink';
import { BRANDS, BRAND_PICKS } from '@/components/works/data';
import { asset } from '@/lib/base';

export function Label({ n, children }: { n: string; children: string }) {
  return <p className="lbl"><b>({n})</b><i aria-hidden="true" />{children}</p>;
}

/* ---------- (02) できること ----------
   「AIで何でも」に見せない。何を頼めて、何が出てくるのかを具体的に書く。
   **確認待ち：**受託の範囲（5本）と中身 */
const SERVICES = [
  {
    en: 'Produce', jp: '店舗・事業のプロデュース',
    body: '業態の企画、出店の計画、メニューと価格、現場が回る運営の仕組みまで。飲食ブランドを立ち上げてきた経験から、続けられる事業の形にします。',
    tags: ['業態開発', '出店計画', 'メニュー・価格設計', '運営の仕組み'],
  },
  {
    en: 'Branding', jp: 'ブランディング',
    body: '店名・ロゴから、パッケージ、店内のグラフィック、メニュー表や販促物まで。手に取られ、覚えてもらえる見た目をつくります。',
    tags: ['ネーミング・ロゴ', 'パッケージ', 'サイン・店内グラフィック', '販促物'],
  },
  {
    en: 'Web & App', jp: 'Webサイト・アプリ',
    body: 'コーポレートサイト、LP、予約・注文・会員などのアプリや管理画面。画面の設計から開発、公開したあとの改善まで。',
    tags: ['コーポレートサイト', 'LP', '業務アプリ', 'UI/UX設計'],
  },
  {
    en: 'Film', jp: '映像・SNS',
    body: 'プロモーション映像やSNS広告を、企画から撮影ディレクション、編集まで。伝えるところまで、同じチームで。',
    tags: ['プロモーション映像', 'SNS広告', '撮影ディレクション'],
  },
  {
    en: 'Store DX', jp: '店舗のDX・AI活用',
    body: 'モバイルオーダーやクチコミ獲得の自社プロダクト「GOOD SERIES」の導入、日々の業務の仕組み化、AIの組み込みまで。',
    tags: ['GOOD SERIES', '業務の仕組み化', 'AIの組み込み'],
  },
];

export function Services() {
  return (
    <section
      id="services" className="pn sec sv" aria-labelledby="sv-h"
      data-panel="(02) SERVICES" data-ground="paper" data-at="1.12,0.08,0" data-from="top" data-transit="1.4" data-bulge="0.3"
      data-mood="0.8,0.45,1,0.8,0.5"
    >
      <Label n="02">Services</Label>
      <div data-clear>
        <Decode className="ttl" lines={['WHAT WE DO.']} />
        <p className="ttl-jp" id="sv-h">事業の設計から、店づくり、デジタルまで。</p>
      </div>
      <p className="sec-lead" data-clear>飲食・店舗のビジネスを中心に、事業の立ち上げからブランド、Webサイトやアプリ、映像まで。必要なところだけでも、まるごとでも。</p>
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

/* ---------- (03) 実績の概要 ----------
   ここは「パッと見てわかる」だけ。詳しくは /works（ブランディング／SaaS の2本立て） */
export function WorksOverview() {
  return (
    <section
      id="work" className="pn sec wo" aria-labelledby="wo-h"
      data-panel="(03) WORKS" data-ground="paper" data-at="-0.35,0.3,-0.3" data-transit="1.05" data-bulge="0.45"
      data-mood="0.9,0.4,1,0.9,0.55"
    >
      <Label n="03">Works</Label>
      <div className="wo-head">
        <div data-clear>
          <Decode className="ttl" lines={['SELECTED', 'WORKS.']} />
          <p className="ttl-jp" id="wo-h">立ち上げてきた店と、つくってきたプロダクト。</p>
        </div>
        <TLink className="btn btn--line wo-all" href="/works">実績をすべて見る<Arrow /></TLink>
      </div>
      <div className="wo-grid">
        <TLink className="wo-card wo-card--brand" href="/works#branding">
          <p className="wo-k" data-clear><b>(A)</b>Branding &amp; Produce</p>
          <div className="wo-mosaic">
            {BRAND_PICKS.map((ph, i) => (
              <img key={ph.src} className={`wo-ph wo-ph--${i}`} src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} loading="lazy" decoding="async" />
            ))}
          </div>
          <div className="wo-txt" data-clear>
            <h3>飲食ブランドの立ち上げ</h3>
            <p>業態の企画から、店づくり、ブランドデザイン、出店まで。神戸・大阪から、名古屋、東京へ。</p>
            <p className="wo-names">{BRANDS.map((b) => <span key={b.id}>{b.name}</span>)}</p>
          </div>
        </TLink>
        <TLink className="wo-card wo-card--saas" href="/works#saas">
          <p className="wo-k" data-clear><b>(B)</b>SaaS</p>
          <div className="wo-saas">
            <span className="wo-logo"><img src={asset('/img/logos/good-order.svg')} width={584} height={57} alt="GOOD ORDER" /></span>
            <span className="wo-logo"><img src={asset('/img/logos/good-review.svg')} width={631} height={67} alt="GOOD REVIEW" /></span>
          </div>
          <div className="wo-txt" data-clear>
            <h3>店舗のための自社プロダクト</h3>
            <p>モバイルオーダーの GOOD ORDER と、クチコミ獲得の GOOD REVIEW。企画からブランド、UI、開発、映像まで社内でつくっています。</p>
          </div>
        </TLink>
      </div>
    </section>
  );
}

/* ---------- (04) チーム ----------
   「2人の仲の良さ」ではなく、**専門の違うプロが2人いる**という見せ方（本人判断） */
export function Team() {
  return (
    <section
      id="team" className="pn sec tm" aria-labelledby="tm-h"
      data-panel="(04) TEAM" data-ground="ink" data-at="0.7,0.3,0.3" data-transit="1.1" data-bulge="0.65"
      data-mood="1.3,0.4,1,1,0.7"
    >
      <Label n="04">Team</Label>
      <div data-clear>
        <Decode className="ttl" lines={['THE PRODUCER', '& THE DESIGNER.']} />
        <p className="ttl-jp" id="tm-h">事業のプロと、クリエイティブのプロ。</p>
      </div>
      <p className="sec-lead" data-clear>
        飲食ブランドを立ち上げてきたビジネスプロデューサーと、大規模サービスのUI/UXを手がけてきたクリエイティブディレクター。
        専門の違う2人が、ひとつのチームで動きます。
      </p>
      <div className="tm-duo">
        <Person
          head="yosuke" cm={173} tap="stumble" bio="yosuke"
          roleEn="Co-founder / Business Producer" role="共同創業者 / ビジネスプロデューサー"
          name="板倉 洋輔" en="Yosuke Itakura"
          ex="2014年に YORKYS BRUNCH を立ち上げ、クレープ、生ドーナツ、チーズ料理と複数の飲食ブランドを展開。神戸・大阪から、名古屋、東京へ出店してきた。"
          tags={['事業設計', '店舗プロデュース', '業態開発', '出店']}
        />
        <span className="tm-x" aria-hidden="true">×</span>
        <Person
          head="temma" cm={160} tap="startle" bio="temma"
          roleEn="Co-founder / Creative Director" role="共同創業者 / クリエイティブディレクター"
          name="平澤 天真" en="Temma Hirasawa"
          ex="グラフィックからUI、映像まで。大規模サービスのUI/UX設計を経て、GOOD SERIES のブランド、UI、開発、映像を統括する。"
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

/* ---------- (05) 宣言（メッセージ） ----------
   一語（文節）ずつ灯る。区切りは意味の切れ目で。[文字, 強調]。「×」の点に触れると色が反転する */
const MANIFESTO: [string, boolean?][][] = [
  [['いいサービスは、'], ['事業の目と、'], ['つくる手の、'], ['両方から'], ['生まれる。']],
  [['売れる理由を'], ['知っている人と、'], ['使われる形を'], ['知っている人が、'], ['最初から'], ['同じ机で'], ['考える。', true]],
  [['AIは、'], ['手を抜くためではなく、'], ['速さと精度を'], ['上げるための', true], ['道具です。']],
];

export function Manifesto() {
  return (
    <section
      id="why" className="pn mf" aria-labelledby="mf-h"
      data-panel="(05) MESSAGE" data-ground="ink" data-at="-0.6,0.3,0" data-transit="1.05" data-bulge="0.55" data-hold="0.6"
      data-mood="1.15,0.35,1,0.9,0.6"
    >
      <Label n="05">Message</Label>
      <h2 id="mf-h" className="sr">私たちが大事にしていること</h2>
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
        <div className="mf-x" data-stamp="cross" data-tint="" aria-hidden="true"><span>×</span></div>
      </div>
      <div className="mq" data-stamp="marquee" data-mode="marquee" data-fit="fill" data-e="0,0.03,0,0">
        <span className="mq-txt">Business × Creative × AI</span>
      </div>
    </section>
  );
}

/* ---------- (06) 原則：見出し＋奥へ並ぶ3枚 ---------- */
export function How() {
  return (
    <section
      id="how" className="pn sec" aria-labelledby="how-h"
      data-panel="(06) HOW WE WORK" data-ground="paper" data-at="1.25,-0.5,-0.25" data-transit="1.1" data-bulge="0.7"
    >
      <Label n="06">How we work</Label>
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
    body: '売上につながるか。現場が回るか。続けられるか。事業を自分の手で立ち上げてきた目線で、何をつくるか、何をつくらないかから一緒に決めます。',
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
          data-panel={`(06-${i + 1}) ${c.en.toUpperCase()}`} data-ground={c.ground} data-at={c.at} data-from={c.from}
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

/* ---------- (07) 締め ----------
   at は奥（原則の3枚）から手前へ戻る量を含む。前のパネルが変わったら z を合わせ直すこと */
export function Contact({ n = '07', at = '0.45,0.45,2.75' }: { n?: string; at?: string }) {
  return (
    <section
      id="contact-cta" className="pn sec ct" aria-labelledby="ct-h"
      data-panel={`(${n}) CONTACT`} data-ground="shu" data-at={at} data-transit="2.0" data-bulge="map"
      data-mood="1.7,0.7,1,1.3,0.95" data-hold="0.3"
    >
      <Label n={n}>Contact</Label>
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

/* ---------- フッター（トップと /works ではパネル、/company ではふつうのフッター） ---------- */
export function Footer({ panel = false }: { panel?: boolean }) {
  const attrs = panel
    ? { 'data-panel': '(—) UTUTU', 'data-ground': 'ink', 'data-at': '0,0.12,0', 'data-transit': '0.75', 'data-bulge': '0.2', 'data-hold': '0' }
    : {};
  return (
    <footer className={`ft${panel ? ' pn' : ''}`} id="foot" {...attrs}>
      <div className="ft-cols" data-clear>
        <div>
          <p className="ft-h"><TLink href="/#top">Studio</TLink></p>
          <ul>
            <li><TLink href="/#services">できること</TLink></li>
            <li><TLink href="/#team">チーム</TLink></li>
            <li><TLink href="/#why">メッセージ</TLink></li>
          </ul>
        </div>
        <div>
          <p className="ft-h"><TLink href="/works">Works</TLink></p>
          <ul>
            <li><TLink href="/works#branding">飲食ブランド</TLink></li>
            <li><TLink href="/works#saas">SaaS</TLink></li>
          </ul>
        </div>
        <div>
          <p className="ft-h"><TLink href="/company">Company</TLink></p>
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
        <p className="ft-note">株式会社UTUTU<br />Creative Studio for DX<br />Kobe - Tokyo, Japan</p>
      </div>
      <div className="ft-mark" data-stamp="mark" data-fit="fill" aria-hidden="true"><Mark /></div>
      <p className="ft-copy"><span>© 2026 UTUTU Inc.</span><span>Business × Creative, with AI.</span></p>
    </footer>
  );
}
