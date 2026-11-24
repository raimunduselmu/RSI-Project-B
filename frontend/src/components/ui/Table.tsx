import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

export interface Column<T> {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  /** kolom rata kanan (angka/aksi) */
  align?: 'left' | 'right' | 'center';
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  rowKey?: (row: T, i: number) => string | number;
  onRowClick?: (row: T) => void;
  /** baris yang sedang dipilih (disorot) */
  isActive?: (row: T) => boolean;
}

export function Table<T>({ columns, rows, empty = 'Belum ada data', rowKey, onRowClick, isActive }: Props<T>) {
  const align = (a?: Column<T>['align']) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900/[0.08]">
      <table className="min-w-full text-sm">
        <thead className="bg-white">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={cn('whitespace-nowrap px-3.5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink/45', align(c.align))}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900/[0.07]">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-ink/40">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr
                key={rowKey ? rowKey(r, i) : i}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cn(
                  'transition',
                  onRowClick && 'cursor-pointer',
                  isActive?.(r) ? 'bg-ember-500/[0.12] shadow-[inset_3px_0_0_0_#FF7F2A]' : 'hover:bg-ember-50',
                )}
              >
                {columns.map((c, j) => (
                  <td key={j} className={cn('whitespace-nowrap px-3.5 py-3 text-ink/85 xl:whitespace-normal', align(c.align), c.className)}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
