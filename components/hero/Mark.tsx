/* 正式ロゴ（1160×149）を1文字ずつに分けたもの。
   **1文字＝2段の g。**外側が位置、内側が左右反転。分けておかないと
   「すべる」と「裏返す」を同じ文字に別々にかけられない（heroEngine の startMarkPlay）。
   影は付けない。CSSの filter:drop-shadow は動きに追従せず欠けるため使わないこと。 */
export function Mark({ title }: { title?: string }) {
  return (
    <svg
      viewBox="0 0 1160 149"
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const })}
    >
    <g transform="translate(8 8)" fillRule="evenodd">
        <g transform="translate(0,0)"><g><path d="M0 0V57A76 76 0 0 0 152 57V0H130V57A54 54 0 0 1 22 57V0Z"/></g></g>
        <g transform="translate(248,0)"><g><path d="M0 0H152V22H87V133H65V22H0Z"/></g></g>
        <g transform="translate(496,0)"><g><path d="M0 0V57A76 76 0 0 0 152 57V0H130V57A54 54 0 0 1 22 57V0Z"/></g></g>
        <g transform="translate(744,0)"><g><path d="M0 0H152V22H87V133H65V22H0Z"/></g></g>
        <g transform="translate(992,0)"><g><path d="M0 0V57A76 76 0 0 0 152 57V0H130V57A54 54 0 0 1 22 57V0Z"/></g></g>
      </g>
    </svg>
  );
}
