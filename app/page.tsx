import { Hero } from '@/components/home/Hero';
import { Cards, Contact, Footer, How, Ledger, Manifesto, Products, Services, Team, Work } from '@/components/home/Sections';
import { WorldRoot } from '@/components/world/WorldRoot';
import '@/components/home/home.css';

/* トップ。座標の世界に並ぶパネルの順番＝情報の順番。
   「誰が・何を → なぜ今 → どう違う（奥へ3枚） → 何を頼める → 証拠（横へ2つ） → 誰が → 次の一歩」。
   **順番を入れ替えるときは、この並びの理屈と、各パネルの data-at（置き場所）ごと見直すこと。** */
export default function Home() {
  return (
    <WorldRoot>
      <Hero />
      <Manifesto />
      <How />
      <Cards />
      <Services />
      <Work />
      <Products />
      <Ledger />
      <Team />
      <Contact />
      <Footer panel />
    </WorldRoot>
  );
}
