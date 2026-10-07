import type { Metadata } from 'next';
import { Contact, Footer } from '@/components/home/Sections';
import { Ledger, SaasProducts, WorksHero } from '@/components/works/Works';
import { WorldRoot } from '@/components/world/WorldRoot';
import '@/components/home/home.css';
import '@/components/works/works.css';

export const metadata: Metadata = {
  title: '実績 — UTUTU',
  description:
    '株式会社UTUTUの実績。店舗のための自社プロダクト GOOD SERIES（モバイルオーダーの GOOD ORDER、クチコミを増やす GOOD REVIEW）。企画からブランド、UI、開発、映像まで社内でつくっています。',
};

/* 実績。トップと同じ座標の世界に、自社プロダクト（GOOD SERIES）を並べる（飲食ブランドは 2026-10-07 に外した）。
   締めの at の z は、手前（0）へ戻る量。前のパネルの奥行きを変えたら合わせ直すこと */
export default function WorksPage() {
  return (
    <WorldRoot>
      <WorksHero />
      <SaasProducts />
      <Ledger />
      <Contact n="C" at="0.45,0.45,0.6" />
      <Footer panel />
    </WorldRoot>
  );
}
