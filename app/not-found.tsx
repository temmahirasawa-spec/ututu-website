/* 404。短く詫びてトップへ帰す。 */

import Link from 'next/link';
import './not-found.css';

export default function NotFound() {
  return (
    <main className="nf">
      <p className="nf-code" aria-hidden="true">404</p>
      <h1>このページは、見つかりませんでした。</h1>
      <p className="nf-lead">URLが変わったか、打ち間違いかもしれません。</p>
      <Link className="btn" href="/">トップへ戻る</Link>
    </main>
  );
}
