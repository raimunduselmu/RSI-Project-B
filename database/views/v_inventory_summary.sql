-- v_inventory_summary
-- TSD 5.3 | FSD-2.19, 2.40 — ringkasan inventaris per kategori: jumlah per kondisi & status
-- Aset terhapus (is_deleted = 1) tidak dihitung.
CREATE OR ALTER VIEW dbo.v_inventory_summary
AS
SELECT
  c.category_id,
  c.category_code,
  c.category_name,
  COUNT(a.asset_id) AS total,
  SUM(CASE WHEN a.asset_condition = N'BAIK' THEN 1 ELSE 0 END) AS kondisi_baik,
  SUM(CASE WHEN a.asset_condition = N'RUSAK_RINGAN' THEN 1 ELSE 0 END) AS kondisi_rusak_ringan,
  SUM(CASE WHEN a.asset_condition = N'RUSAK_BERAT' THEN 1 ELSE 0 END) AS kondisi_rusak_berat,
  SUM(CASE WHEN a.status = N'TERSEDIA' THEN 1 ELSE 0 END) AS status_tersedia,
  SUM(CASE WHEN a.status = N'DIPINJAM' THEN 1 ELSE 0 END) AS status_dipinjam,
  SUM(CASE WHEN a.status = N'DIGUNAKAN' THEN 1 ELSE 0 END) AS status_digunakan,
  SUM(CASE WHEN a.status = N'PEMELIHARAAN' THEN 1 ELSE 0 END) AS status_pemeliharaan,
  SUM(CASE WHEN a.status = N'HILANG' THEN 1 ELSE 0 END) AS status_hilang,
  SUM(CASE WHEN a.status = N'NONAKTIF' THEN 1 ELSE 0 END) AS status_nonaktif,
  SUM(CASE WHEN a.source_type IN (N'DONASI', N'HIBAH') THEN 1 ELSE 0 END) AS sumber_donasi_hibah,
  ISNULL(SUM(a.acquisition_value), 0) AS total_nilai_perolehan
FROM dbo.asset_categories c
LEFT JOIN dbo.assets a ON a.category_id = c.category_id AND a.is_deleted = 0
GROUP BY c.category_id, c.category_code, c.category_name;
