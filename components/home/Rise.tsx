import type { ElementType, ReactNode } from 'react';

/* 見出しを行ごとに下から出す（globals.css の .rise）。
   行は配列で渡す。**行の切れ目は意味の切れ目で決めること。**成り行きで折り返すと
   1行の中で2回動いて見える。.in は reveal.ts が付ける */
export function Rise({ as: Tag = 'h2', lines, className = '', delay }: {
  as?: ElementType; lines: ReactNode[]; className?: string; delay?: string;
}) {
  return (
    <Tag className={`rise ${className}`} style={delay ? { ['--d' as string]: delay } : undefined}>
      {lines.map((l, i) => (
        <span key={i}><span style={{ ['--i' as string]: i }}>{l}</span></span>
      ))}
    </Tag>
  );
}
