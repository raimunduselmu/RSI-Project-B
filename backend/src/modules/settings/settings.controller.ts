import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import { ok } from '../../lib/response.js';
import { saveFile } from '../../lib/storage.js';
import * as service from './settings.service.js';

/** GET /  —  Daftar parameter (FSD-2.45). Bendahara hanya QRIS & tarif. */
export const list = asyncHandler(async (req, res) => ok(res, await service.list(req.user!)));

/** PATCH /:key  —  Ubah parameter; QRIS_IMAGE memakai multipart field "file" (FSD-2.45) */
export const updateByKey = asyncHandler(async (req, res) => {
  if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    throw new AppError('ERR-VAL-05', 'Gambar QRIS harus JPG/PNG dengan ukuran maksimal 5 MB');
  }
  const image = req.file ? await saveFile(req.file.buffer, req.file.originalname, 'settings') : undefined;
  ok(res, await service.update(req.params.key, req.body?.value, image, req.user!, req.ip), 'Parameter disimpan');
});
