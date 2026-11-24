// Tata letak dua kolom untuk variasi layar (dipakai template D/E/F bila mockup FSD berbeda).
import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

/** main = kolom lebar; side = kolom sempit. sideFirst = kolom sempit di kiri. */
export function Split({ main, side, sideFirst, sideWidth = 360 }: { main: ReactNode; side: ReactNode; sideFirst?: boolean; sideWidth?: 320 | 360 | 400 }) {
  const cols = {
    320: sideFirst ? 'xl:grid-cols-[320px_minmax(0,1fr)]' : 'xl:grid-cols-[minmax(0,1fr)_320px]',
    360: sideFirst ? 'xl:grid-cols-[360px_minmax(0,1fr)]' : 'xl:grid-cols-[minmax(0,1fr)_360px]',
    400: sideFirst ? 'xl:grid-cols-[400px_minmax(0,1fr)]' : 'xl:grid-cols-[minmax(0,1fr)_400px]',
  }[sideWidth];
  return (
    <div className={cn('grid items-start gap-6', cols)}>
      {sideFirst ? (
        <>
          <div className="space-y-6">{side}</div>
          <div className="min-w-0 space-y-6">{main}</div>
        </>
      ) : (
        <>
          <div className="min-w-0 space-y-6">{main}</div>
          <div className="space-y-6">{side}</div>
        </>
      )}
    </div>
  );
}
