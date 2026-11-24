// Bukti perilaku overriding (AppError/ValidationError) dan overloading (rupiah). Jalankan: npm test
import { describe, expect, it } from 'vitest';
import { AppError, ValidationError } from '../src/lib/AppError.js';
import { rupiah } from '../src/lib/format.js';

describe('Overriding — AppError.toResponse()', () => {
  it('AppError memakai bentuk standar, status dari katalog ERR', () => {
    const e = new AppError('ERR-DATA-01', 'Aset tidak ditemukan');
    expect(e.status).toBe(404);
    expect(e.toResponse()).toEqual({ status: 'error', error_code: 'ERR-DATA-01', message: 'Aset tidak ditemukan' });
  });
  it('ValidationError menimpa toResponse() dan menambah hint', () => {
    const e = new ValidationError({ start_at: ['Tanggal mulai wajib diisi'] });
    expect(e instanceof AppError).toBe(true);
    expect(e.status).toBe(422);
    expect(e.toResponse().hint).toBe('Periksa kembali isian yang ditandai merah');
    expect(e.toResponse().error_code).toBe('ERR-VAL-01');
  });
  it('pemanggilan sama, hasil mengikuti jenis objek (polimorfisme)', () => {
    const list: AppError[] = [new AppError('ERR-VAL-01'), new ValidationError({ a: ['x'] })];
    expect(list.map((e) => 'hint' in e.toResponse())).toEqual([false, true]);
  });
});

describe('Overloading — rupiah()', () => {
  it('rupiah(number), rupiah(number, boolean), rupiah(string)', () => {
    expect(rupiah(150000)).toBe('Rp150.000');
    expect(rupiah(150000, false)).toBe('150.000');
    expect(rupiah('2500000.00')).toBe('Rp2.500.000');
  });
});
