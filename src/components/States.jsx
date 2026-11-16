import { isConfigured } from '../lib/supabase'

export function Loading({ label = 'Yuklanmoqda' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-siyoh/60">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-moviy border-t-transparent" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  const notConfigured = error?.code === 'not_configured'
  return (
    <div role="alert" className="rounded-2xl border border-qizil/25 bg-qizil/[0.04] p-6">
      <p className="font-semibold text-siyoh">{notConfigured ? 'Ma’lumotlar bazasi ulanmagan' : 'Ma’lumotni yuklab bölmadi'}</p>
      <p className="mt-1 text-siyoh/70">
        {notConfigured
          ? 'Bu bölim Supabase ulangaç işlaydi. Sozlaş tartibi README faylida yozilgan.'
          : error?.message || 'Qayta urinib köring.'}
      </p>
      {onRetry && !notConfigured && (
        <button type="button" onClick={onRetry} className="btn-outline mt-4">
          Qayta yuklaş
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-siyoh/20 bg-qogoz p-8 text-center">
      <p className="font-display text-2xl font-semibold text-tun">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-md text-siyoh/70">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Notice({ tone = 'info', children }) {
  const tones = {
    info: 'border-moviy/30 bg-moviy/[0.06]',
    success: 'border-yaşil/40 bg-yaşil/[0.08]',
    error: 'border-qizil/30 bg-qizil/[0.05]',
  }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-[15px] text-siyoh ${tones[tone]}`}>
      {children}
    </div>
  )
}

export function ConfigNotice() {
  if (isConfigured) return null
  return (
    <Notice>
      Ma’lumotlar bazasi ulanmagan: natijalar va fikrlar hozirça saqlanmaydi. Viktorina, diplom va karta şu qurilmada töliq işlaydi.
    </Notice>
  )
}
