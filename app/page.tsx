import { Hero } from '@/components/home/Hero';
import { HomeEffects } from '@/components/home/HomeEffects';
import { Contact, Footer, Manifesto, Principles, Services, Team, Work } from '@/components/home/Sections';
import '@/components/home/home.css';

/* トップ。情報の順番は「誰が・何を → なぜ今 → どう違う → 何を頼める → 証拠 → 誰が → 次の一歩」。
   **順番を入れ替えるときは、この並びの理屈ごと見直すこと。** */
export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Manifesto />
        <Principles />
        <Services />
        <Work />
        <Team />
        <Contact />
      </main>
      <Footer />
      <HomeEffects />
    </>
  );
}
