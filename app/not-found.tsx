/* 404。紙の世界観のまま、短く詫びてトップへ帰す。
   KV・映像パイプラインからは完全に独立（このファイルと not-found.css だけ）。 */

import Link from 'next/link';
import { Mark } from '@/components/hero/Mark';
import './not-found.css';

export default function NotFound() {
  return (
    <div className="nf">
      <p className="nf-code">404</p>
      <h1>このページは、お品書きにありません。</h1>
      <p className="nf-lead">
        URLが変わったか、打ち間違いかもしれません。<br />
        お手数ですが、入口からお入りください。
      </p>
      <Link className="nf-home" href="/" aria-label="トップへ戻る">
        <Mark title="UTUTU" />
        <span>トップへ戻る</span>
      </Link>
    </div>
  );
}
