/* GOOD ORDER の注文画面（見本）。
   以前は実店舗での撮影画像を置いていたが、店名と料理写真が写っていたため
   **HTMLで組んだ見本に差し替えた**（2026-10-01）。店名は架空、料理は写真ではなく
   GOOD SERIES の線画の文法（インキの線・ベタ塗り）で描いている。
   **実在の店名・料理写真をここに戻さないこと。**

   大きさは枠の幅に追従させる（.pv-phone-scr を container にして cqw で組む）。
   390px 幅の画面を基準に、1cqw = 3.9px として数値を取っている。 */

type Dish = 'pancake' | 'latte' | 'toast' | 'salad';

const ITEMS: { dish: Dish; tag: string; name: string; price: string }[] = [
  { dish: 'pancake', tag: 'パンケーキ', name: 'パンケーキ プレーン', price: '¥1,100' },
  { dish: 'toast', tag: 'トースト', name: 'アボカドトースト', price: '¥1,180' },
  { dish: 'latte', tag: 'ドリンク', name: 'カフェラテ', price: '¥600' },
  { dish: 'salad', tag: 'サラダ', name: 'グリーンサラダ', price: '¥880' },
];

export function OrderScreen() {
  return (
    <div className="os" role="img" aria-label="GOOD ORDER の注文画面の見本。上部にカテゴリのタブ、その下におすすめのメニューが大きく、続いて人気のメニューが並んでいる">
      <div className="os-bar">
        <span className="os-store">GOOD CAFE<small>SAMPLE STORE</small></span>
        <i className="os-burger" />
      </div>
      <div className="os-tabs">
        <b>おすすめ</b><span>パンケーキ</span><span>トースト</span><span>ドリンク</span>
      </div>
      <div className="os-chips"><span>カスタマイズ</span><span>アレルギー</span><span>苦手な食材</span></div>
      <div className="os-hero">
        <Plate dish="pancake" big />
        <span className="os-badge">本日のおすすめ</span>
      </div>
      <p className="os-kicker">人気ランキング殿堂入り！長く愛されるメニュー</p>
      <p className="os-h">Best Seller<small>ベストセラー</small></p>
      <div className="os-row">
        {ITEMS.map((it) => (
          <div className="os-item" key={it.name}>
            <div className="os-thumb"><Plate dish={it.dish} /></div>
            <span className="os-tag">{it.tag}</span>
            <span className="os-name">{it.name}</span>
            <span className="os-price">{it.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 皿。線画の文法（インキの線・ベタ塗り）で、写真は使わない */
function Plate({ dish, big }: { dish: Dish; big?: boolean }) {
  return (
    <span className={`os-plate os-${dish}${big ? ' os-big' : ''}`} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}
