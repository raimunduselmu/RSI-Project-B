/** Membuat tautan wa.me (WhatsApp hanya lewat tautan, tanpa API). */
export function waLink(phone: string, message: string) {
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '62');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
