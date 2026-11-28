
// SCR-11 Lapor Pemakaian Internal (FSD-2.13) — Template D

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormGrid, FormPage, FormSection } from '@/components/templates';
import { Input, Select } from '@/components/ui';

export default function UsageReport() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    responsibleName: '',
    phone: '',
    division: '',
    activityName: '',
    room: '',
    asset: '',
    startTime: '',
    endTime: '',
  });

  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // FormEvent tanpa generic agar sesuai dengan tipe FormPage.
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice('');
    setError('');

    if (
      !form.responsibleName.trim() ||
      !form.phone.trim() ||
      !form.division.trim() ||
      !form.activityName.trim() ||
      !form.startTime ||
      !form.endTime
    ) {
      setError('Lengkapi seluruh informasi wajib terlebih dahulu.');
      return;
    }

    if (!/^[0-9+\-\s]{9,16}$/.test(form.phone.trim())) {
      setError(
        'Nomor telepon harus berisi 9–16 digit atau karakter nomor telepon yang valid.',
      );
      return;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError('Waktu selesai harus lebih besar dari waktu mulai.');
      return;
    }

    const report = {
      ...form,
      submittedAt: new Date().toISOString(),
    };

    console.info('Laporan pemakaian internal:', report);

    setNotice(
      'Laporan pemakaian berhasil divalidasi. Data masih berupa prototipe frontend dan belum dikirim ke server.',
    );
  }

  return (
    <div className="space-y-5">
      <FormPage
        code="SCR-11"
        eyebrow="Sarana Prasarana"
        title="Lapor Pemakaian Internal"
        subtitle="Tanpa persetujuan bertingkat. Jadwal langsung masuk kalender."
        submitLabel="Kirim Laporan"
        onSubmit={handleSubmit}
        onCancel={() => nav('/dashboard')}
      >
        <FormSection title="Informasi Penanggung Jawab" />

        <FormGrid>
          <Input
            no={1}
            label="Nama Penanggung Jawab"
            required
            maxLength={100}
            value={form.responsibleName}
            onChange={(event) =>
              updateField('responsibleName', event.target.value)
            }
            placeholder="Masukkan nama penanggung jawab"
            hint="Isi sesuai profil pengguna."
          />

          <Input
            no={2}
            label="Telepon"
            required
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="Contoh: 081234567890"
          />

          <Input
            no={3}
            label="Divisi"
            required
            maxLength={80}
            value={form.division}
            onChange={(event) => updateField('division', event.target.value)}
            placeholder="Masukkan divisi"
          />

          <Input
            no={4}
            label="Nama Kegiatan"
            required
            maxLength={150}
            value={form.activityName}
            onChange={(event) =>
              updateField('activityName', event.target.value)
            }
            placeholder="Masukkan nama kegiatan"
          />
        </FormGrid>

        <FormSection title="Ruangan dan Aset" />

        <FormGrid>
          <Select
            no={5}
            label="Ruangan"
            options={[
              'Aula Gereja Kampus',
              'Ruang Doa',
              '— Tidak memakai ruangan —',
            ]}
            value={form.room}
            onChange={(event) => updateField('room', event.target.value)}
          />

          <Select
            no={6}
            label="Aset Dipakai"
            hint="Pilih aset yang tersedia."
            options={[
              'Keyboard Yamaha PSR, Mic Wireless (2)',
              'Proyektor Epson EB-X',
              '— Tidak ada —',
            ]}
            value={form.asset}
            onChange={(event) => updateField('asset', event.target.value)}
          />
        </FormGrid>

        <FormSection title="Jadwal Pemakaian" />

        <FormGrid>
          <Input
            no={7}
            label="Waktu Mulai"
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(event) => updateField('startTime', event.target.value)}
          />

          <Input
            no={8}
            label="Perkiraan Selesai"
            type="datetime-local"
            required
            value={form.endTime}
            onChange={(event) => updateField('endTime', event.target.value)}
          />
        </FormGrid>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}
      </FormPage>
    </div>
  );
}
