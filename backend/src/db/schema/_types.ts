import { customType } from 'drizzle-orm/mssql-core';

/** UNIQUEIDENTIFIER (UUID) — dipakai sebagai PK sesuai TSD Bagian 4 */
export const uniqueidentifier = customType<{ data: string }>({
  dataType() {
    return 'uniqueidentifier';
  },
});

/** DATE (tanggal saja). Nilai dikirim/dibaca sebagai string 'YYYY-MM-DD'. */
export const dateOnly = customType<{ data: string; driverData: string | Date }>({
  dataType() {
    return 'date';
  },
});

/** DECIMAL(15,2) untuk nominal rupiah. */
export const money = customType<{ data: number; driverData: number | string }>({
  dataType() {
    return 'decimal(15,2)';
  },
  fromDriver(v) {
    return Number(v);
  },
});
