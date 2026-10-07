/* /works の各パネル。トップと同じ座標の世界（WorldRoot）に並べる。

   **自社プロダクト（GOOD SERIES）だけ**を見せる（2026-10-07 本人判断で、飲食ブランドの紹介は PC・スマホとも外した）。
   入口 → GOOD ORDER → GOOD REVIEW → 社内でつくった数 → 締め */

import { Label } from '@/components/home/Sections';
import { OrderPanel, ReviewPanel } from '@/components/products/Products';
import { Decode } from '@/components/site/Decode';
import { Arrow } from '@/components/site/Header';

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
        <p className="ttl-jp" id="wh-h">店舗のための、自社プロダクト。</p>
      </div>
      <p className="sec-lead" data-clear>
        店を立ち上げ、回してきた中で見えた課題から生まれたプロダクト群「GOOD SERIES」。
        企画、ブランド、UI、開発、LP、映像まで、社内でつくっています。
      </p>
      <ol className="wh-index">
        <li>
          <a href="#order">
            <b>(01)</b>
            <span className="wh-en">GOOD ORDER</span>
            <span className="wh-jp">モバイルオーダー</span>
            <Arrow />
          </a>
        </li>
        <li>
          <a href="#review">
            <b>(02)</b>
            <span className="wh-en">GOOD REVIEW</span>
            <span className="wh-jp">クチコミを増やす</span>
            <Arrow />
          </a>
        </li>
        <li>
          <a href="#ledger">
            <b>(03)</b>
            <span className="wh-en">Made in-house</span>
            <span className="wh-jp">社内でつくった数</span>
            <Arrow />
          </a>
        </li>
      </ol>
    </section>
  );
}

export function SaasProducts() {
  return (
    <>
      <OrderPanel panel={{
        'data-panel': '(01) GOOD ORDER', 'data-ground': 'order', 'data-at': '0.2,0.3,-0.4',
        'data-transit': '1.1', 'data-bulge': '0.45', 'data-hold': '0.35', 'data-mood': '0.7,0.4,0.9,1,0.5',
      }} />
      <ReviewPanel panel={{
        'data-panel': '(02) GOOD REVIEW', 'data-ground': 'review', 'data-from': 'top', 'data-at': '1.08,-0.06,0',
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
      data-panel="(03) IN-HOUSE" data-ground="paper" data-at="-0.55,0.3,-0.2" data-transit="1.0" data-bulge="0.4"
    >
      <p className="lbl"><b>(03)</b><i aria-hidden="true" />Made in-house</p>
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
