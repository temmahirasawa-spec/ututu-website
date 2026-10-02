import type { Metadata } from 'next';
import { Contact, Footer } from '@/components/home/Sections';
import { BrandPanels, BrandingIntro, Ledger, SaasIntro, SaasProducts, WorksHero } from '@/components/works/Works';
import { WorldRoot } from '@/components/world/WorldRoot';
import '@/components/home/home.css';
import '@/components/works/works.css';

export const metadata: Metadata = {
  title: '実績 — UTUTU',
  description:
    '株式会社UTUTUの実績。立ち上げてきた飲食ブランド（YORKYS BRUNCH、YORKYS Creperie、PIECE OF BAKE、FROMA）と、店舗のための自社プロダクト GOOD SERIES（GOOD ORDER、GOOD REVIEW）。',
};

/* 実績。トップと同じ座標の世界に、(A) ブランディング → (B) SaaS の順で並べる。
   締めの at の z は、手前（0）へ戻る量。前のパネルの奥行きを変えたら合わせ直すこと */
export default function WorksPage() {
  return (
    <WorldRoot>
      <WorksHero />
      <BrandingIntro />
      <BrandPanels />
      <SaasIntro />
      <SaasProducts />
      <Ledger />
      <Contact n="C" at="0.45,0.45,0.95" />
      <Footer panel />
    </WorldRoot>
  );
}
