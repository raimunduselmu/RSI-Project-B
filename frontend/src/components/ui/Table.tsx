import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function Table<T>({ columns, rows, empty = 'Belum ada data' }: { columns: Column<T>[]; rows: T[]; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        <thead className="bg-brand-50">
          <tr>
            {columns.map((c) => (
              <th key={c.header} className="px-4 py-2 text-left font-semibold text-brand-900">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-stone-500">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="hover:bg-stone-50">
                {columns.map((c) => (
                  <td key={c.header} className={c.className ?? 'px-4 py-2'}>
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
