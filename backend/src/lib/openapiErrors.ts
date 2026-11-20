// Melengkapi spesifikasi OpenAPI dengan semua kemungkinan response galat,
// supaya Swagger menampilkan 401/403/404/409/422/429/503 di bagian "Responses".
// Aturan otomatis per endpoint (response yang sudah ditulis manual di YAML tidak ditimpa):
//   - semua endpoint            → 503 ERR-SYS-01
//   - butuh login (security)    → 401 ERR-AUTH-01, 403 ERR-AUTH-03/05/06
//   - ada body/query/path param → 422 ERR-VAL-01 (+ ERR-FILE-01 bila multipart)
//   - path memuat {id}          → 404 ERR-DATA-01
//   - form publik (rate limit)  → 429 ERR-RATE-01
// Kode yang disebut di description manual (mis. "ERR-LOAN-01 / ERR-LOAN-03") ikut diberi contoh.
import { ERR, type ErrorCode } from './errors.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;
const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;
const RATE_LIMITED = new Set(['post /loans', 'post /public/status', 'post /auth/login']);

function example(code: ErrorCode) {
  return { status: 'error', error_code: code, message: ERR[code].message };
}

function response(codes: ErrorCode[], note?: string) {
  const examples: Json = {};
  for (const c of codes) examples[c] = { summary: ERR[c].message, value: example(c) };
  return {
    description: note ?? codes.map((c) => `${c}: ${ERR[c].message}`).join(' · '),
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, examples } },
  };
}

function add(responses: Json, status: string, codes: ErrorCode[]) {
  const existing = responses[status];
  if (!existing) { responses[status] = response(codes); return; }
  if (existing.content) return; // sudah lengkap ditulis manual
  // description manual berisi kode → pakai kode itu sebagai contoh, pertahankan teksnya
  const named = String(existing.description ?? '').match(/ERR-[A-Z]+-\d{2}/g) as ErrorCode[] | null;
  const list = (named ?? codes).filter((c) => c in ERR);
  responses[status] = response(list.length ? list : codes, list.length ? list.map((c) => `${c}: ${ERR[c].message}`).join(' · ') : existing.description);
}

export function withErrorResponses(spec: Json): Json {
  const globalSecured = Array.isArray(spec.security) && spec.security.length > 0;
  for (const [path, item] of Object.entries<Json>(spec.paths ?? {})) {
    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;
      const r: Json = (op.responses ??= {});
      const secured = op.security ? op.security.length > 0 : globalSecured;
      const params = [...(item.parameters ?? []), ...(op.parameters ?? [])];
      const multipart = !!op.requestBody?.content?.['multipart/form-data'];

      // kode galat yang sudah disebut manual dikelompokkan ke status HTTP-nya
      for (const [status, res] of Object.entries<Json>(r)) {
        if (/^[45]\d\d$/.test(status)) add(r, status, []);
        void res;
      }
      if (secured) {
        add(r, '401', ['ERR-AUTH-01']);
        add(r, '403', ['ERR-AUTH-03', 'ERR-AUTH-05', 'ERR-AUTH-06']);
      }
      if (op.requestBody || params.length) add(r, '422', multipart ? ['ERR-VAL-01', 'ERR-FILE-01'] : ['ERR-VAL-01']);
      if (path.includes('{')) add(r, '404', ['ERR-DATA-01']);
      if (RATE_LIMITED.has(`${method} ${path}`)) add(r, '429', ['ERR-RATE-01']);
      add(r, '503', ['ERR-SYS-01']);
    }
  }
  return spec;
}
