// SCR-08 Kalender & Ketersediaan (FSD-2.9) — desain I (unik)
// Data: GET /calendar?month=YYYY-MM&room_id= · GET /rooms · GET /availability
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input, Select } from '@/components/ui';
import { useFetch } from '@/hooks/useFetch';
import { qs } from '@/hooks/usePaged';
import { api, ApiError } from '@/lib/api';
import { cn, tanggalJam } from '@/lib/format';
import type { CalendarEvent, Room } from '@/lib/types';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (d: Date) => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
const jam = (d: string) => new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(new Date(d));
const isIbadah = (e: CalendarEvent) => /LITURG|IBADAH|MISA|SCHEDULE/i.test(e.source_type);
const localInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

type Check = { ok: boolean; text: string } | null;

export default function Kalender() {
  const nav = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [roomFilter, setRoomFilter] = useState('');

  const { data: rooms } = useFetch<Room[]>('/rooms');
  const { data: cal, loading, error } = useFetch<{ month: string; events: CalendarEvent[] }>(`/calendar${qs({ month: monthKey(month), room_id: roomFilter })}`);

  // form cek ketersediaan
  const [roomId, setRoomId] = useState('');
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18);
  const [start, setStart] = useState(localInput(tomorrow));
  const [end, setEnd] = useState(localInput(new Date(tomorrow.getTime() + 3 * 3600_000)));
  const [check, setCheck] = useState<Check>(null);
  const [checking, setChecking] = useState(false);
  const chosenRoom = roomId || (rooms?.[0] ? String(rooms[0].room_id) : '');

  const cells = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Senin = 0
    const days = new Date(y, m + 1, 0).getDate();
    const out: Date[] = [];
    for (let i = -offset; out.length < Math.ceil((offset + days) / 7) * 7; i++) out.push(new Date(y, m, i + 1));
    return out;
  }, [month]);

  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const eventsOn = (d: Date) =>
    (cal?.events ?? []).filter((e) => {
      const s = new Date(e.start_at);
      const en = new Date(e.end_at);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400_000);
      return s < dayEnd && en > dayStart;
    });

  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  const doCheck = async () => {
    setChecking(true);
    setCheck(null);
    try {
      const r = await api.get<{ available: boolean; conflicts: { conflict_on: string; start_at: string; end_at: string }[] }>(
        `/availability${qs({ room_id: chosenRoom, start_at: new Date(start).toISOString(), end_at: new Date(end).toISOString() })}`,
      );
      const name = rooms?.find((x) => String(x.room_id) === chosenRoom)?.room_name ?? 'Ruangan';
      setCheck(
        r.available
          ? { ok: true, text: `${name} kosong pada ${tanggalJam(start)} – ${jam(new Date(end).toISOString())}.` }
          : { ok: false, text: `${name} sudah terpakai ${tanggalJam(r.conflicts[0].start_at)} – ${jam(r.conflicts[0].end_at)}. Pilih waktu lain.` },
      );
    } catch (e) {
      const err = e as ApiError;
      setCheck({ ok: false, text: err.details ? Object.values(err.details).flat().join(' ') : err.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="eyebrow">Layanan publik</span>
          <span className="rounded-full border border-slate-900/[0.14] px-2 py-0.5 font-mono text-[10px] text-ink/60">SCR-08</span>
        </div>
        <h1>Kalender & Ketersediaan</h1>
        <p className="mt-1.5 text-sm text-ink/75">Jadwal yang sudah disetujui dan jadwal ibadah terbit. Dapat dibuka tanpa login.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card
          title={<span className="capitalize">{monthLabel(month)}</span>}
          no={1}
          actions={
            <>
              <Select className="!w-44 !py-1.5" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
                <option value="">Semua ruangan</option>
                {rooms?.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.room_name}
                  </option>
                ))}
              </Select>
              <Button size="sm" variant="secondary" onClick={() => shift(-1)} aria-label="Bulan sebelumnya">
                ←
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMonth(new Date(now.getFullYear(), now.getMonth(), 1))}>
                Hari ini
              </Button>
              <Button size="sm" variant="secondary" onClick={() => shift(1)} aria-label="Bulan berikutnya">
                →
              </Button>
            </>
          }
        >
          {error && (
            <div className="mb-4">
              <Alert tone="error">{error.message}</Alert>
            </div>
          )}
          <div className={cn('overflow-hidden rounded-xl border border-slate-900/[0.08] transition-opacity', loading && 'opacity-50')}>
            <div className="grid grid-cols-7 bg-white">
              {DAYS.map((d) => (
                <div key={d} className="px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/55">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((d, i) => {
                const inMonth = d.getMonth() === month.getMonth();
                const evs = inMonth ? eventsOn(d) : [];
                const today = sameDay(d, now);
                return (
                  <div key={i} className={cn('min-h-[92px] border-t border-slate-900/[0.08] p-2', i % 7 !== 0 && 'border-l', !inMonth && 'bg-white')}>
                    <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px]', !inMonth ? 'text-ink/25' : today ? 'bg-ember-500 text-white shadow-soft' : 'text-ink/80')}>
                      {d.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {evs.slice(0, 3).map((e, j) => {
                        const label = `${jam(e.start_at)} ${e.room_name ? `${e.room_name} · ` : ''}${e.title}`;
                        return (
                          <p
                            key={j}
                            title={`${label}${e.ref_code ? ` (${e.ref_code})` : ''}`}
                            className={cn('truncate rounded-md px-1.5 py-0.5 text-[11px]', isIbadah(e) ? 'bg-brand-400/15 text-brand-700' : 'bg-ember-500/20 text-ember-700')}
                          >
                            {label}
                          </p>
                        );
                      })}
                      {evs.length > 3 && <p className="px-1.5 font-mono text-[10px] text-ink/50">+{evs.length - 3} lagi</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-5 font-mono text-[11px] text-ink/60">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-300" /> Ibadah terbit
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ember-400" /> Peminjaman/kegiatan disetujui
            </span>
            {!loading && cal && <span>{cal.events.length} jadwal bulan ini</span>}
          </div>
        </Card>

        <Card title="Cek Ketersediaan" className="lg:sticky lg:top-24">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              doCheck();
            }}
          >
            <Select no={2} label="Ruangan" required value={chosenRoom} onChange={(e) => {
              setRoomId(e.target.value);
              setCheck(null);
            }}>
              {rooms?.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.room_name}
                </option>
              ))}
            </Select>
            <Input no={3} label="Waktu Mulai" type="datetime-local" required value={start} onChange={(e) => (setStart(e.target.value), setCheck(null))} />
            <Input no={4} label="Waktu Selesai" type="datetime-local" required value={end} onChange={(e) => (setEnd(e.target.value), setCheck(null))} />
            <Button type="submit" variant="secondary" className="w-full" icon="search" loading={checking}>
              Cek Ketersediaan
            </Button>
            {check && (
              <Alert tone={check.ok ? 'success' : 'warning'} title={check.ok ? 'Tersedia' : 'Tidak tersedia'}>
                {check.text}
              </Alert>
            )}
            <Button
              variant="brand"
              className="w-full"
              icon="arrowRight"
              disabled={!check?.ok}
              onClick={() => nav('/borrow', { state: { room_id: Number(chosenRoom), start, end } })}
            >
              Ajukan Peminjaman
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
