// Katalog kode galat dari FSD Bagian 6 (Error Handling). Tambahkan bila perlu.
export const ERR = {
  'ERR-VAL-01': { status: 422, message: 'Data yang dikirim tidak valid' },
  'ERR-AUTH-01': { status: 401, message: 'Anda harus login untuk mengakses halaman ini' },
  'ERR-AUTH-02': { status: 401, message: 'Username atau password tidak valid' },
  'ERR-AUTH-03': { status: 403, message: 'Anda tidak memiliki izin untuk mengakses ini' },
  'ERR-AUTH-04': { status: 422, message: 'Password lama tidak sesuai' },
  'ERR-AUTH-05': { status: 403, message: 'Akun tidak aktif. Hubungi Admin' },
  'ERR-AUTH-06': { status: 403, message: 'Anda wajib mengganti password terlebih dahulu' },
  'ERR-LOCK-01': { status: 403, message: 'Akun dikunci. Coba lagi dalam 15 menit' },
  'ERR-DATA-01': { status: 404, message: 'Data yang diminta tidak ditemukan' },
  'ERR-DATA-02': { status: 409, message: 'Data sudah terdaftar' },
  'ERR-DATA-04': { status: 409, message: 'Data periode yang sudah diarsipkan tidak dapat diubah' },
  'ERR-LOAN-01': { status: 409, message: 'Jadwal bentrok dengan kegiatan lain. Pilih waktu lain' },
  'ERR-LOAN-02': { status: 409, message: 'Aset tidak tersedia untuk dipinjam' },
  'ERR-LOAN-03': { status: 409, message: 'Pengajuan sudah diproses dan tidak dapat diubah' },
  'ERR-KAS-01': { status: 409, message: 'Bulan yang dipilih sudah lunas atau sedang diverifikasi' },
  'ERR-KAS-02': { status: 403, message: 'Iuran kas hanya untuk pengurus aktif periode berjalan' },
  'ERR-KAS-03': { status: 409, message: 'Pengajuan ini tidak dapat Anda verifikasi' },
  'ERR-CFG-01': { status: 409, message: 'Parameter sistem belum diatur. Hubungi Admin' },
  'ERR-STS-01': { status: 404, message: 'Kode atau nomor telepon tidak sesuai' },
  'ERR-FILE-01': { status: 422, message: 'File harus PDF/JPG/PNG dengan ukuran maksimal 5 MB' },
  'ERR-RATE-01': { status: 429, message: 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi' },
  'ERR-SYS-01': { status: 503, message: 'Layanan tidak tersedia. Silakan coba lagi' },
  'ERR-SYS-02': { status: 501, message: 'Fitur belum diimplementasikan' },
} as const;

export type ErrorCode = keyof typeof ERR;
