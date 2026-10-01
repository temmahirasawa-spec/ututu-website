import type { Metadata } from 'next';
import { CompanyClient } from '@/components/company/CompanyClient';

export const metadata: Metadata = {
  title: '会社概要・お問い合わせ — UTUTU',
  description:
    '株式会社UTUTUの会社概要と、お問い合わせの窓口です。制作・開発のご相談も、GOOD SERIES の導入も、取材も。まだ形になっていない相談ほど歓迎です。',
};

export default function CompanyPage() {
  return <CompanyClient />;
}
