import { customType } from 'drizzle-orm/mssql-core';

/** UNIQUEIDENTIFIER (UUID) — dipakai sebagai PK sesuai TSD Bagian 4 */
export const uniqueidentifier = customType<{ data: string }>({
  dataType() {
    return 'uniqueidentifier';
  },
});
