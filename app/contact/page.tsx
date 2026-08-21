import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import '@/components/site/site.css';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'お問い合わせ — UTUTU',
  description:
    '株式会社UTUTU へのお問い合わせ。GOOD ORDER / GOOD REVIEW の導入のご相談、取材・協業のご相談を承っています。',
};

/* お問い合わせ。フォームだけクライアント側（ContactForm）。
   送信は /api/contact が受ける。宛先と鍵はサーバー側の環境変数にある。 */

export default function Contact() {
  return (
    <>
      <SiteHeader variant="page" />
      <main className="pg">
        <div className="wrap">
          <div className="pg-head">
            <p className="pg-eyebrow">Contact</p>
            <h1>お問い合わせ</h1>
            <p className="pg-lead">
              導入のご相談、プロダクトについてのご質問、取材や協業のお話まで。
              私たちも店をやっているので、現場の話がいちばん早く通じます。どうぞそのままお書きください。
            </p>
          </div>

          <section className="pg-sec">
            <ContactForm />
          </section>

          <SiteFooter />
        </div>
      </main>
    </>
  );
}
