-- sp_sync_kas_dues
-- FSD-2.43 BR-120 | dipanggil saat pengurus ditetapkan/diakhiri, saat membuka halaman Iuran Kas, dan oleh seeder
-- Membentuk tagihan bulanan untuk setiap bulan yang tercakup masa jabatan pengurus pada periode AKTIF
-- (sejak bulan penetapan jabatan sampai akhir periode / akhir jabatan). Aman dipanggil berulang.
-- Tagihan BELUM_LUNAS yang tidak lagi tercakup (jabatan diakhiri) dihapus bila belum pernah diajukan.
-- @user_id NULL = semua pengurus. Hasil: SUCCESS | RATE_NOT_SET | NO_ACTIVE_PERIOD
CREATE OR ALTER PROCEDURE dbo.sp_sync_kas_dues
  @user_id  UNIQUEIDENTIFIER = NULL,
  @inserted INT = NULL OUTPUT,
  @result   NVARCHAR(30) = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  SET @inserted = 0;

  DECLARE @period_id INT, @p_start DATE, @p_end DATE;
  SELECT @period_id = period_id, @p_start = start_date, @p_end = end_date FROM dbo.periods WHERE status = N'AKTIF';
  IF @period_id IS NULL BEGIN SET @result = N'NO_ACTIVE_PERIOD'; RETURN; END;

  -- Tarif dibaca saat tagihan dibentuk (BR-127: perubahan tarif hanya untuk tagihan baru)
  DECLARE @rate DECIMAL(15,2) = TRY_CAST((SELECT setting_value FROM dbo.system_settings WHERE setting_key = N'KAS_MONTHLY_RATE') AS DECIMAL(15,2));
  IF @rate IS NULL OR @rate <= 0 BEGIN SET @result = N'RATE_NOT_SET'; RETURN; END;

  -- Daftar bulan periode aktif
  DECLARE @months TABLE (m DATE PRIMARY KEY);
  WITH mm AS (
    SELECT DATEFROMPARTS(YEAR(@p_start), MONTH(@p_start), 1) AS m
    UNION ALL
    SELECT DATEADD(MONTH, 1, m) FROM mm WHERE DATEADD(MONTH, 1, m) <= @p_end
  )
  INSERT INTO @months (m) SELECT m FROM mm OPTION (MAXRECURSION 120);

  -- Bulan yang tercakup jabatan aktif tiap pengurus (pengurus harus punya akun)
  DECLARE @covered TABLE (user_id UNIQUEIDENTIFIER, m DATE, PRIMARY KEY (user_id, m));
  INSERT INTO @covered (user_id, m)
  SELECT DISTINCT o.user_id, mo.m
  FROM dbo.officers o
  JOIN dbo.positions ps ON ps.position_id = o.position_id
  JOIN dbo.divisions dv ON dv.division_id = ps.division_id AND dv.period_id = @period_id
  JOIN @months mo ON mo.m >= DATEFROMPARTS(YEAR(o.start_date), MONTH(o.start_date), 1)
                 AND mo.m <= COALESCE(o.end_date, @p_end)
  WHERE o.user_id IS NOT NULL AND (@user_id IS NULL OR o.user_id = @user_id);

  BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.kas_dues (user_id, period_id, due_month, amount, status)
    SELECT c.user_id, @period_id, c.m, @rate, N'BELUM_LUNAS'
    FROM @covered c
    WHERE NOT EXISTS (SELECT 1 FROM dbo.kas_dues d WHERE d.user_id = c.user_id AND d.due_month = c.m);
    SET @inserted = @@ROWCOUNT;

    -- Jabatan diakhiri → hapus tagihan yang tidak tercakup lagi, hanya yang belum pernah diajukan
    DELETE d FROM dbo.kas_dues d
    WHERE d.period_id = @period_id AND d.status = N'BELUM_LUNAS'
      AND (@user_id IS NULL OR d.user_id = @user_id)
      AND NOT EXISTS (SELECT 1 FROM @covered c WHERE c.user_id = d.user_id AND c.m = d.due_month)
      AND NOT EXISTS (SELECT 1 FROM dbo.kas_payment_items i WHERE i.due_id = d.due_id);

    COMMIT;
    SET @result = N'SUCCESS';
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;
