// SCR-19 Audit Log (FSD-2.22) — Template C
import { useState } from 'react';
import { PanelSection, ProcessPage } from '@/components/templates';
import { Badge, Input, Select } from '@/components/ui';

interface Log {
  id: string;
  time: string;
  user: string;
  action: string;
  object: string;
  ip: string;
  oldV: string;
  newV: string;
}

// TODO: ganti dengan useFetch<Log[]>('/audit-logs?...') — hanya baca (append-only)
const DUMMY: Log[] = [
  { id: '1', time: '18/11 09.41', user: 'admin', action: 'PASSWORD_RESET_BY_ADMIN', object: 'users · andi.bendahara', ip: '103.23.10.4', oldV: '{ "must_change_password": false }', newV: '{ "must_change_password": true }' },
  { id: '2', time: '18/11 09.12', user: 'andi.bendahara', action: 'SETTING_UPDATED', object: 'KAS_MONTHLY_RATE', ip: '36.71.8.20', oldV: '{ "value": "20000" }', newV: '{ "value": "25000" }' },
  { id: '3', time: '18/11 08.55', user: 'sarpras.adi', action: 'LOGIN_SUCCESS', object: '—', ip: '103.23.10.9', oldV: '—', newV: '—' },
  { id: '4', time: '18/11 08.53', user: 'sarpras.adi', action: 'LOGIN_FAILED', object: '—', ip: '103.23.10.9', oldV: '—', newV: '—' },
  { id: '5', time: '17/11 20.10', user: 'gregorius.pht', action: 'ROLE_CHANGED', object: 'user_roles · clara.liturgi', ip: '182.1.3.77', oldV: '{ "roles": [] }', newV: '{ "roles": ["Liturgi"] }' },
];

export default function AuditLog() {
  const [sel, setSel] = useState<Log | null>(DUMMY[1]);
  return (
    <ProcessPage<Log>
      code="SCR-19"
      eyebrow="Administrasi"
      title="Audit Log"
      subtitle="Catatan append-only seluruh aksi penting."
      filters={
        <>
          <Input no={1} label="Pengguna" placeholder="username" />
          <Select no={2} label="Jenis Aksi" options={['Semua aksi', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_RESET_BY_ADMIN', 'SETTING_UPDATED', 'ROLE_CHANGED']} />
          <Input no={3} label="Rentang Tanggal" defaultValue="11/11/2026 – 18/11/2026" />
          <Input no={4} label="IP" placeholder="mis. 103.23.x.x" />
        </>
      }
      listTitle="Log"
      rows={DUMMY}
      rowKey={(l) => l.id}
      selected={sel}
      onSelect={setSel}
      columns={[
        { header: 'Waktu', cell: (l) => <span className="whitespace-nowrap font-mono text-[12.5px]">{l.time}</span> },
        { header: 'Pengguna', cell: (l) => l.user },
        { header: 'Aksi', cell: (l) => <Badge status={l.action} /> },
        { header: 'Objek', cell: (l) => l.object },
        { header: 'IP', cell: (l) => <span className="font-mono text-[12.5px]">{l.ip}</span> },
      ]}
      panel={(l) => (
        <PanelSection title="Detail Perubahan">
          <p className="mb-3 font-mono text-[11px] text-ink/55">
            {l.action} · {l.object}
          </p>
          <pre className="overflow-x-auto rounded-xl border border-slate-900/[0.08] bg-white p-4 font-mono text-[12px] leading-relaxed text-ink/90">
{`old_values: ${l.oldV}
new_values: ${l.newV}
user: ${l.user}
ip: ${l.ip}`}
          </pre>
        </PanelSection>
      )}
    />
  );
}
