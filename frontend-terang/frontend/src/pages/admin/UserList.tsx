// SCR-04 Manajemen Pengguna (FSD-2.3, 2.4) — Template B
import { useState } from 'react';
import { TableFormPage, TrackingCode } from '@/components/templates';
import { Alert, Badge, Card, Input, Select, Toggle } from '@/components/ui';

interface UserRow {
  id: string;
  name: string;
  username: string;
  roles: string[];
  active: boolean;
}

// TODO: ganti dengan useFetch<UserRow[]>('/users')
const DUMMY: UserRow[] = [
  { id: '1', name: 'Andi Pratama', username: 'andi.bendahara', roles: ['Bendahara', 'PHT'], active: true },
  { id: '2', name: 'Fransiskus Adi', username: 'sarpras.adi', roles: ['Sarpras'], active: true },
  { id: '3', name: 'RD. Paulus Widodo', username: 'romo.paulus', roles: ['Pastor'], active: true },
  { id: '4', name: 'Clara Wulandari', username: 'clara.liturgi', roles: ['Liturgi'], active: true },
  { id: '5', name: 'Stefanus Raka', username: 'liturgi.2025', roles: [], active: false },
];

export default function UserList() {
  const [active, setActive] = useState(true);
  const [tempFor, setTempFor] = useState<string | null>('andi.bendahara');

  return (
    <TableFormPage<UserRow>
      code="SCR-04"
      eyebrow="Administrasi"
      title="Manajemen Pengguna"
      subtitle="Akun hanya untuk Admin, pengurus, dan Pastor. Umat dan tamu tidak memiliki akun."
      listTitle="Daftar Pengguna"
      listActions={<input className="field !w-56 !py-1.5" placeholder="Cari nama / username" />}
      rows={DUMMY}
      rowKey={(u) => u.id}
      columns={[
        { header: 'Nama', cell: (u) => <span className="font-medium text-ink">{u.name}</span> },
        { header: 'Username', cell: (u) => <span className="whitespace-nowrap font-mono text-[12.5px]">{u.username}</span> },
        { header: 'Role', cell: (u) => (u.roles.length ? <div className="flex flex-wrap gap-1">{u.roles.map((r) => <Badge key={r} status={r} tone="blue" label={r} />)}</div> : '—') },
        { header: 'Status', cell: (u) => <Badge status={u.active ? 'AKTIF' : 'NONAKTIF'} /> },
        {
          header: 'Aksi',
          cell: (u) =>
            u.active ? (
              <span className="flex gap-3 whitespace-nowrap font-mono text-xs">
                <button className="text-ink/70 hover:text-ink">Ubah</button>
                <button className="text-brand-700 hover:text-brand-700" onClick={() => setTempFor(u.username)}>
                  Reset Password
                </button>
              </span>
            ) : (
              <button className="font-mono text-xs text-brand-700 hover:text-ink">Aktifkan</button>
            ),
        },
      ]}
      afterTable={
        tempFor && (
          <Card title={`Password Sementara — ${tempFor}`} className="ring-1 ring-amber-300/30">
            <p className="mb-3 text-sm text-ink/65">Hanya tampil sekali. Sampaikan langsung ke pengguna.</p>
            <TrackingCode code="Kmk-7x2Q" />
            <div className="mt-4">
              <Alert tone="warning">Pengguna wajib mengganti password saat login berikutnya.</Alert>
            </div>
          </Card>
        )
      }
      formTitle="Tambah Pengurus"
      submitLabel="Simpan & Buat Password Sementara"
      form={
        <>
          <Input no={1} label="Nama Lengkap" required maxLength={100} defaultValue="Andi Pratama" />
          <Input no={2} label="Username" required minLength={4} maxLength={50} hint="4–50 karakter, unik" defaultValue="andi.bendahara" />
          <Input no={3} label="Email" type="email" hint="Opsional, untuk notifikasi" defaultValue="andi.pratama@student.uns.ac.id" />
          <Input no={4} label="Telepon" defaultValue="081234500011" />
          <Select no={5} label="Jabatan & Periode" hint="Role diberikan otomatis sesuai divisi jabatan" options={['Bendahara I · Divisi Keuangan · 2026/2027', 'Kepala Divisi · Sarana Prasarana · 2026/2027', 'Koordinator · Liturgi · 2026/2027', 'Ketua · PHT · 2026/2027']} />
          <div className="space-y-1.5">
            <p className="field-label">Role Tambahan</p>
            <div className="flex gap-5 text-sm text-ink/85">
              <label className="flex items-center gap-2"><input type="checkbox" className="check" /> Admin</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="check" /> Pastor</label>
            </div>
          </div>
          <Toggle checked={active} onChange={setActive} label="Status aktif" />
        </>
      }
    />
  );
}
