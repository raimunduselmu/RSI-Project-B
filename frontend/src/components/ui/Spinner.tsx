export function Spinner({ full }: { full?: boolean }) {
  const s = <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />;
  return full ? <div className="flex min-h-screen items-center justify-center bg-white">{s}</div> : s;
}
