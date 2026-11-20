/** Nomor HP Indonesia: 08xx / +628xx / 628xx, 10–15 digit */
export const PHONE_REGEX = /^(\+62|62|0)8\d{7,12}$/;

/** Hapus spasi/tanda hubung lalu ubah 08xx → 628xx agar mudah dibandingkan */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[\s-]/g, '').replace(/^\+/, '');
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
}

/** Bandingkan dua nomor setelah dinormalkan */
export const samePhone = (a: string, b: string) => normalizePhone(a) === normalizePhone(b);
