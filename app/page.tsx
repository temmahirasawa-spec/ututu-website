import { Hero } from '@/components/home/Hero';
import { Cards, Contact, Footer, How, Manifesto, Services, Team, WorksOverview } from '@/components/home/Sections';
import { WorldRoot } from '@/components/world/WorldRoot';
import '@/components/home/home.css';
import '@/components/works/works.css';

/* トップ。座標の世界に並ぶパネルの順番＝情報の順番。
   「誰が・何を → 何を頼めるか → 実績 → 誰がやるか → 思い（宣言・原則は奥へ3枚） → 次の一歩」。
   思いやコンセプトは最後に置く（2026-10-02 本人判断）。
   **順番を入れ替えるときは、この並びの理屈と、各パネルの data-at（置き場所）ごと見直すこと。** */
export default function Home() {
  return (
    <WorldRoot>
      <Hero />
      <Services />
      <WorksOverview />
      <Team />
      <Manifesto />
      <How />
      <Cards />
      <Contact />
      <Footer panel />
    </WorldRoot>
  );
}
