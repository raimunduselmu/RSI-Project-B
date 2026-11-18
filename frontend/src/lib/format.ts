export const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export const tanggal = (d: string | Date) =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(d));

export const tanggalJam = (d: string | Date) =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
