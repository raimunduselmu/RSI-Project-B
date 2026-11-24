// SCR-05 Daftar Aset (FSD-2.5, 2.6, 2.7) — Template A
// Data: GET /assets?q=&category_id=&status=&page=  ·  GET /asset-categories
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TablePage } from '@/components/templates';
import { Alert, Badge, Button, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { qs, usePaged } from '@/hooks/usePaged';
import type { AssetRow, Category } from '@/lib/types';

const STATUSES = ['TERSEDIA', 'DIPINJAM', 'DIGUNAKAN', 'PEMELIHARAAN', 'HILANG', 'NONAKTIF'];
const PER_PAGE = 15;

export default function AssetList() {
  const nav = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole('Sarpras');

  const [q, setQ] = useState('');
  const [search, setSearch] = useState(''); // dikirim ke API setelah jeda ketik
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data: categories } = useFetch<Category[]>('/asset-categories');
  const { rows, meta, loading, error } = usePaged<AssetRow>(`/assets${qs({ q: search, category_id: category, status, page, per_page: PER_PAGE })}`);

  const toggle = (code: string) => setPicked((p) => (p.includes(code) ? p.filter((x) => x !== code) : [...p, code]));

  return (
    <TablePage<AssetRow>
      code="SCR-05"
      eyebrow="Sarana Prasarana"
      title="Daftar Aset"
      subtitle="Cari aset berdasarkan kode unik, nama, atau kategori."
      actions={
        canEdit && (
          <>
            <Button variant="secondary" icon="printer" disabled={!picked.length} onClick={() => nav('/assets/labels', { state: { codes: picked } })}>
              Cetak Label ({picked.length})
            </Button>
            <Button icon="plus" onClick={() => nav('/assets/create')}>
              Tambah Aset
            </Button>
          </>
        )
      }
      filters={
        <>
          <input className="field" placeholder="Cari kode unik atau nama aset…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua kategori</option>
            {categories?.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </>
      }
      topSlot={error && <Alert tone="error">{error.message}</Alert>}
      rows={rows}
      rowKey={(a) => a.asset_id}
      onRowClick={(a) => nav(`/assets/${a.asset_code}`)}
      empty={loading ? 'Memuat data…' : 'Belum ada aset yang cocok'}
      columns={[
        ...(canEdit
          ? [
              {
                header: '',
                className: 'w-10',
                cell: (a: AssetRow) => (
                  <input type="checkbox" className="check" checked={picked.includes(a.asset_code)} onClick={(e) => e.stopPropagation()} onChange={() => toggle(a.asset_code)} />
                ),
              },
            ]
          : []),
        { header: 'Kode Unik', cell: (a) => <span className="whitespace-nowrap font-mono text-[13px] text-brand-700">{a.asset_code}</span> },
        { header: 'Nama Aset', cell: (a) => <span className="font-medium text-ink">{a.asset_name}</span> },
        { header: 'Kategori', cell: (a) => a.category_name },
        { header: 'Lokasi', cell: (a) => a.location_text },
        { header: 'Kondisi', cell: (a) => <Badge status={a.asset_condition} /> },
        { header: 'Status', cell: (a) => <Badge status={a.status} /> },
        { header: '', align: 'right', cell: () => <span className="whitespace-nowrap font-mono text-xs text-ink/60">Detail →</span> },
      ]}
      footer={
        meta && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Menampilkan {rows.length} dari {meta.total} aset
            </span>
            {meta.last_page > 1 && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ← Sebelumnya
                </Button>
                <span>
                  {meta.current_page} / {meta.last_page}
                </span>
                <Button size="sm" variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
                  Berikutnya →
                </Button>
              </div>
            )}
          </div>
        )
      }
    />
  );
}
