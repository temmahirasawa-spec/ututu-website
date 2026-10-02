/* /works の各パネル。トップと同じ座標の世界（WorldRoot）に並べる。

   2本立て（2026-10-02 本人判断）
   (A) Branding & Produce … 立ち上げてきた飲食ブランド。写真で見せる（横へ1ブランドずつ進む）
   (B) SaaS … 自社プロダクト GOOD SERIES（components/products/ の2枚と、社内でつくった数）

   書き方の決まりは components/works/data.ts の先頭。**立ち上げた事実を過去形で。** */

/* eslint-disable @next/next/no-img-element -- 写真は枠に合わせて object-fit で切る。width / height は必ず付ける */

import { Label } from '@/components/home/Sections';
import { OrderPanel, ReviewPanel } from '@/components/products/Products';
import { Decode } from '@/components/site/Decode';
import { Arrow } from '@/components/site/Header';
import { BRANDS, type Brand } from './data';

/* ---------- 入口 ---------- */
export function WorksHero() {
  return (
    <section
      id="top" className="pn sec wh" aria-labelledby="wh-h"
      data-panel="(W) WORKS" data-ground="paper" data-mood="1.2,0.45,1,1,0.6" data-hold="0.15"
    >
      <Label n="W">Works</Label>
      <div data-clear>
        <Decode as="h1" className="ttl wh-ttl" lines={['SELECTED', 'WORKS.']} delay={250} />
        <p className="ttl-jp" id="wh-h">立ち上げてきた店と、つくってきたプロダクト。</p>
      </div>
      <p className="sec-lead" data-clear>
        飲食ブランドの企画から店づくり、ブランドデザイン、出店まで。そこで見えた課題から生まれた、店舗のための自社プロダクトまで。
        事業とクリエイティブの両方から手がけてきたものです。
      </p>
      <ol className="wh-index">
        <li>
          <a href="#branding">
            <b>(A)</b>
            <span className="wh-en">Branding &amp; Produce</span>
            <span className="wh-jp">飲食ブランドの立ち上げ</span>
            <span className="wh-sub">{BRANDS.map((b) => b.name).join(' ／ ')}</span>
            <Arrow />
          </a>
        </li>
        <li>
          <a href="#saas">
            <b>(B)</b>
            <span className="wh-en">SaaS</span>
            <span className="wh-jp">店舗のための自社プロダクト</span>
            <span className="wh-sub">GOOD ORDER ／ GOOD REVIEW</span>
            <Arrow />
          </a>
        </li>
      </ol>
    </section>
  );
}

/* ---------- (A) ブランディング・店舗プロデュース ---------- */
export function BrandingIntro() {
  return (
    <section
      id="branding" className="pn sec bi" aria-labelledby="bi-h"
      data-panel="(A) BRANDING" data-ground="ink" data-at="1.1,0.25,0" data-transit="1.1" data-bulge="0.45"
      data-mood="1.2,0.4,1,1,0.65"
    >
      <Label n="A">Branding &amp; Produce</Label>
      <div data-clear>
        <Decode className="ttl" lines={['BRANDS', 'WE BUILT.']} />
        <p className="ttl-jp" id="bi-h">立ち上げてきた、飲食ブランド。</p>
      </div>
      <p className="sec-lead" data-clear>
        2014年、兵庫・夙川のブランチカフェから始まり、クレープ、生ドーナツ、チーズ料理へ。
        神戸・大阪から名古屋、東京の商業施設まで、業態の企画から店づくり、ブランドデザイン、出店までを手がけてきました。
      </p>
      <dl className="bi-facts" data-clear>
        <div><dt>Since</dt><dd>2014</dd></div>
        <div><dt>Brands</dt><dd>{String(BRANDS.length).padStart(2, '0')}</dd></div>
        <div><dt>Areas</dt><dd className="bi-areas">兵庫・大阪<br />名古屋・東京</dd></div>
      </dl>
      <p className="bi-next" aria-hidden="true">{BRANDS.map((b) => <span key={b.id}>{b.name}</span>)}<span>→</span></p>
    </section>
  );
}

/** ブランド1つ＝パネル1枚。横へ進む。地は紙と墨を交互に */
export function BrandPanels() {
  return (
    <>
      {BRANDS.map((b, i) => (
        <BrandPanel key={b.id} b={b} i={i} />
      ))}
    </>
  );
}

function BrandPanel({ b, i }: { b: Brand; i: number }) {
  const ground = i % 2 ? 'ink' : 'paper';
  const [main, ...rest] = b.photos;
  return (
    <section
      id={b.id} className="pn sec bp" aria-labelledby={`bp-${b.id}`}
      data-panel={`(A-${i + 1}) ${b.name.toUpperCase()}`} data-ground={ground}
      data-at={i === 0 ? '0.2,0.3,-0.35' : '1.06,0.04,0'} data-from={i === 0 ? undefined : 'top'}
      data-transit={i === 0 ? '1.0' : '0.95'} data-bulge={i === 0 ? '0.35' : '0.15'} data-hold="0.3"
      data-mood="0.75,0.35,1,0.9,0.5"
    >
      <div className="bp-grid">
        <div className="bp-txt" data-clear>
          <p className="lbl"><b>(A-{i + 1})</b><i aria-hidden="true" />Branding &amp; Produce</p>
          <Decode className="ttl bp-ttl" lines={b.title} />
          <h3 className="ttl-jp" id={`bp-${b.id}`}><span className="sr">{b.name} — </span>{b.kind}{b.since ? <small>{b.since}年に立ち上げ</small> : null}</h3>
          <p className="bp-note">{b.note}</p>
          <dl className="bp-roles">
            <dt>Role</dt>
            <dd>{b.roles.map((r) => <span key={r}>{r}</span>)}</dd>
          </dl>
        </div>
        <div className="bp-photos" style={{ ['--n' as string]: rest.length }}>
          <img className="bp-ph bp-ph--main rv" src={main.src} width={main.w} height={main.h} alt={main.alt} loading="lazy" decoding="async" />
          {rest.map((ph, k) => (
            <img key={ph.src} className="bp-ph rv" style={{ ['--d' as string]: `${0.08 * (k + 1)}s` }} src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} loading="lazy" decoding="async" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- (B) SaaS ---------- */
export function SaasIntro() {
  return (
    <section
      id="saas" className="pn sec si" aria-labelledby="si-h"
      data-panel="(B) SAAS" data-ground="paper" data-at="-0.5,0.35,-0.4" data-transit="1.1" data-bulge="0.5"
    >
      <Label n="B">SaaS</Label>
      <div data-clear>
        <Decode className="ttl" lines={['TOOLS FOR', 'STORES.']} />
        <p className="ttl-jp" id="si-h">店舗のための、自社プロダクト。</p>
      </div>
      <p className="sec-lead" data-clear>
        店を立ち上げ、回してきた中で見えた課題から生まれたプロダクト群「GOOD SERIES」。
        企画、ブランド、UI、開発、LP、映像まで、社内でつくっています。ここから先は、横へ進みます。
      </p>
      <p className="wk-next" aria-hidden="true"><span>GOOD ORDER</span><i /><span>GOOD REVIEW</span><i /><span>→</span></p>
    </section>
  );
}

export function SaasProducts() {
  return (
    <>
      <OrderPanel panel={{
        'data-panel': '(B-1) GOOD ORDER', 'data-ground': 'order', 'data-from': 'top', 'data-at': '1.08,0.06,0',
        'data-transit': '1.0', 'data-bulge': '0.12', 'data-hold': '0.35', 'data-mood': '0.7,0.4,0.9,1,0.5',
      }} />
      <ReviewPanel panel={{
        'data-panel': '(B-2) GOOD REVIEW', 'data-ground': 'review', 'data-from': 'top', 'data-at': '1.08,-0.06,0',
        'data-transit': '1.0', 'data-bulge': '0.12', 'data-hold': '0.35', 'data-mood': '0.7,0.4,0.9,1,0.5',
      }} />
    </>
  );
}

/* 数はすべて GOOD SERIES の実物から数えたもの。足したら、ここも直すこと。
   **確認待ち：**「すべて社内で」と言い切ってよいか（外注した部分が無いか）は本人確認 */
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
      data-panel="(B-3) IN-HOUSE" data-ground="paper" data-at="-0.55,0.3,-0.2" data-transit="1.0" data-bulge="0.4"
    >
      <p className="lbl"><b>(B-3)</b><i aria-hidden="true" />Made in-house</p>
      <div data-clear>
        <Decode className="ttl" lines={['MADE', 'IN-HOUSE.']} />
        <p className="ttl-jp" id="ld-h">GOOD SERIES は、企画から映像まで社内でつくりました。</p>
      </div>
      <dl className="ld" data-clear>
        {LEDGER.map(([n, en, jp]) => (
          <div className="ld-i" key={en}>
            <dt><span>{en}</span><small>{jp}</small></dt>
            <dd data-count={n}>{String(n).padStart(2, '0')}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
