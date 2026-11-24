import type { ReactNode } from 'react';

export function Modal({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-900/[0.08] px-5 py-4">
          <h2>{title}</h2>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-900/[0.08] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
