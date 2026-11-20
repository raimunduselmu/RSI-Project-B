/** Membuat tautan wa.me (WhatsApp hanya lewat tautan, tanpa API). */
export function waLink(phone: string, message: string) {
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '62');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/** Isi placeholder templat wa.me: {nama} {bulan} {kode} {total} {tanggal}. Placeholder tanpa nilai dibiarkan. */
export function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (all, k: string) => values[k] ?? all);
}
