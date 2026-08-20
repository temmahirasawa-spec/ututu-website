import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import '@/components/site/site.css';

export const metadata: Metadata = {
  title: '会社概要 — UTUTU',
  description:
    '株式会社UTUTU の会社概要。飲食店をはじめとする店舗のためのソフトウェアをつくり、自分たちでも店を営んでいます。',
};

/* 会社概要。

   **値が未確定の行は「—」のまま置いてある。**（本人の指示：項目だけ先に組む）
   埋めるときは <Row> の tbd を外すこと。tbd を付けたままだと薄いだけで
   見た目は同じなので、外し忘れると空欄に見えないまま公開される。

   まだ来ていないもの：所在地 / 設立 / 資本金 / 代表者（どちらが代表取締役か）
   入っているものは、すべてサイト内で既に述べている事実だけ。 */

function Row({ k, v, tbd }: { k: string; v: React.ReactNode; tbd?: boolean }) {
  return (
    <>
      <dt>{k}</dt>
      <dd className={tbd ? 'tbd' : undefined}>{v}</dd>
    </>
  );
}

export default function About() {
  return (
    <>
      <SiteHeader variant="page" />
      <main className="pg">
        <div className="wrap">
          <div className="pg-head">
            <p className="pg-eyebrow">About</p>
            <h1>会社概要</h1>
            <p className="pg-lead">
              飲食店をはじめとする店舗のために、お客様のスマホで完結するソフトウェアをつくっています。
              私たちは自分たちでも店を営んでいて、毎日の営業のなかで使い、残ったものだけをかたちにしています。
            </p>
          </div>

          <section className="pg-sec">
            <h2>会社情報</h2>
            <dl className="pg-dl">
              <Row k="商号" v="株式会社UTUTU（UTUTU Inc.）" />
              <Row k="所在地" v="—" tbd />
              <Row k="設立" v="—" tbd />
              <Row k="資本金" v="—" tbd />
              <Row k="代表者" v="—" tbd />
              <Row
                k="共同創業者"
                v={
                  <>
                    <p>板倉 洋輔　ビジネスプロデューサー</p>
                    <p>平澤 天真　クリエイティブディレクター</p>
                  </>
                }
              />
              <Row
                k="事業内容"
                v={
                  <>
                    <p>店舗向けソフトウェアの企画・開発・運営</p>
                    <p>飲食店およびフードブランドの企画・運営</p>
                  </>
                }
              />
              <Row
                k="プロダクト"
                v={
                  <>
                    <p>GOOD ORDER　モバイルオーダー</p>
                    <p>GOOD REVIEW　レビューと満足度</p>
                  </>
                }
              />
            </dl>
            <p className="pg-note">※ 一部の項目は準備中です。確定しだい掲載します。</p>
          </section>

          <section className="pg-sec">
            <h2>私たちがつくった店</h2>
            <ul className="pg-brands">
              <li><p className="nm">YORKYS BRUNCH</p><p className="tp">ブランチレストラン</p></li>
              <li><p className="nm">YORKYS CREPERIE</p><p className="tp">クレープリー</p></li>
              <li><p className="nm">FROMA</p><p className="tp">チーズブランド</p></li>
              <li><p className="nm">PIECE OF BAKE</p><p className="tp">ドーナツブランド</p></li>
            </ul>
          </section>

          <SiteFooter />
        </div>
      </main>
    </>
  );
}
