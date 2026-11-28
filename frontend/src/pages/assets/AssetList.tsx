
// SCR-05 Daftar Aset (FSD-2.5, 2.6, 2.7) — Template A
// Data: GET /assets?q=&category_id=&status=&page= · GET /asset-categories

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TablePage } from '@/components/templates';
import { Alert, Badge, Button, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { qs, usePaged } from '@/hooks/usePaged';
import type { AssetRow, Category } from '@/lib/types';

const STATUSES = [
  'TERSEDIA',
  'DIPINJAM',
  'DIGUNAKAN',
  'PEMELIHARAAN',
  'HILANG',
  'NONAKTIF',
];

const PER_PAGE = 15;

export default function AssetList() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole('Sarpras');

  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(q);
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [q]);

  const { data: categories } = useFetch<Category[]>('/asset-categories');

  const { rows, meta, loading, error } = usePaged<AssetRow>(
    `/assets${qs({
      q: search,
      category_id: category,
      status,
      page,
      per_page: PER_PAGE,
    })}`,
  );

  const togglePicked = (code: string) => {
    setPicked((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  return (
    <TablePage<AssetRow>
      code="SCR-05"
      eyebrow="Sarana Prasarana"
      title="Daftar Aset"
      subtitle="Cari aset berdasarkan kode unik, nama, atau kategori."
      actions={
        canEdit && (
          <>
            <Button
              type="button"
              variant="secondary"
              icon="printer"
              disabled={picked.length === 0}
              onClick={() =>
                navigate('/assets/labels', {
                  state: { codes: picked },
                })
              }
            >
              Cetak Label ({picked.length})
            </Button>

            <Button
              type="button"
              icon="plus"
              onClick={() => navigate('/assets/create')}
            >
              Tambah Aset
            </Button>
          </>
        )
      }
      filters={
        <>
          <input
            className="field"
            placeholder="Cari kode unik atau nama aset…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />

          <Select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua kategori</option>

            {categories?.map((item) => (
              <option
                key={item.category_id}
                value={item.category_id}
              >
                {item.category_name}
              </option>
            ))}
          </Select>

          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua status</option>

            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </>
      }
      topSlot={
        error ? <Alert tone="error">{error.message}</Alert> : null
      }
      rows={rows}
      rowKey={(asset) => asset.asset_id}
      onRowClick={(asset) =>
        navigate(`/assets/${asset.asset_code}`)
      }
      empty={
        loading
          ? 'Memuat data…'
          : 'Belum ada aset yang cocok'
      }
      columns={[
        ...(canEdit
          ? [
              {
                header: '',
                className: 'w-10',
                cell: (asset: AssetRow) => (
                  <input
                    type="checkbox"
                    className="check"
                    checked={picked.includes(asset.asset_code)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => togglePicked(asset.asset_code)}
                  />
                ),
              },
            ]
          : []),

        {
          header: 'Kode Unik',
          cell: (asset) => (
            <span className="whitespace-nowrap font-mono text-[13px] text-brand-700">
              {asset.asset_code}
            </span>
          ),
        },
        {
          header: 'Nama Aset',
          cell: (asset) => (
            <span className="font-medium text-ink">
              {asset.asset_name}
            </span>
          ),
        },
        {
          header: 'Kategori',
          cell: (asset) => asset.category_name,
        },
        {
          header: 'Lokasi',
          cell: (asset) => asset.location_text,
        },
        {
          header: 'Kondisi',
          cell: (asset) => (
            <Badge status={asset.asset_condition} />
          ),
        },
        {
          header: 'Status',
          cell: (asset) => (
            <Badge status={asset.status} />
          ),
        },
        {
          header: '',
          align: 'right',
          cell: () => (
            <span className="whitespace-nowrap font-mono text-xs text-ink/60">
              Detail →
            </span>
          ),
        },
      ]}
      footer={
        meta && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Menampilkan {rows.length} dari {meta.total} aset
            </span>

            {meta.last_page > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
                >
                  ← Sebelumnya
                </Button>

                <span>
                  {meta.current_page} / {meta.last_page}
                </span>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={page >= meta.last_page}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                >
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
