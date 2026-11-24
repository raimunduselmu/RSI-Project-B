// SCR-18 Notifikasi (FSD-2.21) — Template A (daftar)
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/format';

// TODO: ganti dengan useFetch('/notifications') + PATCH /notifications/:id/read
const INIT = [
  { id: '1', title: 'Pengajuan peminjaman baru', body: 'PJM-201126-004 dari Budi Santoso menunggu persetujuan.', time: '5 menit lalu', read: false },
  { id: '2', title: 'Pengajuan iuran kas', body: 'IUR-181126-005 dari Clara Wulandari (2 bulan) menunggu verifikasi.', time: '1 jam lalu', read: false },
  { id: '3', title: 'Pemeliharaan jatuh tempo', body: 'Sound System Aula — cek kabel & mixer (H-4).', time: 'Kemarin', read: true },
  { id: '4', title: 'Laporan kerusakan', body: 'Mic Wireless Shure dilaporkan RUSAK oleh Divisi Liturgi.', time: '2 hari lalu', read: true },
];

export default function NotificationList() {
  const [items, setItems] = useState(INIT);
  const unread = items.filter((i) => !i.read).length;
  return (
    <>
      <PageHeader
        code="SCR-18"
        eyebrow="Utama"
        title="Notifikasi"
        subtitle={`${unread} belum dibaca`}
        actions={
          <Button variant="secondary" icon="check" onClick={() => setItems(items.map((i) => ({ ...i, read: true })))}>
            Tandai semua dibaca
          </Button>
        }
      />
      <Card title="Semua Notifikasi" no={1} flush>
        <ul className="divide-y divide-slate-900/[0.07]">
          {items.map((n) => (
            <li key={n.id} className={cn('flex items-start gap-4 px-5 py-4 transition', !n.read && 'bg-brand-400/[0.05]')}>
              <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-white' : 'bg-ember-400 shadow-soft')} />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', n.read ? 'text-ink/80' : 'font-medium text-ink')}>{n.title}</p>
                <p className="mt-0.5 text-sm text-ink/60">{n.body}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-[11px] text-ink/50">{n.time}</span>
                {!n.read && (
                  <button className="font-mono text-[11px] text-brand-700 hover:text-ink" onClick={() => setItems(items.map((i) => (i.id === n.id ? { ...i, read: true } : i)))}>
                    Tandai dibaca
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
