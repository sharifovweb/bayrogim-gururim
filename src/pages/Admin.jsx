import { useCallback, useEffect, useState } from 'react'
import { PageBand } from '../components/Layout'
import { EmptyState, ErrorState, Loading, Notice } from '../components/States'
import { StatsView } from './Stats'
import {
  adminDeleteMessage,
  adminListMessages,
  adminSaveContent,
  adminSetStatus,
  adminSignIn,
  adminSignOut,
  adminStats,
  fetchContent,
  fetchStats,
  getAdminState,
} from '../lib/api'
import { formatDate, formatNumber, useAsync, usePageMeta } from '../lib/hooks'
import { regionName } from '../lib/regions'
import { isConfigured } from '../lib/supabase'

function Login({ onDone }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminSignIn(email.trim(), password)
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-5">
      <div>
        <label htmlFor="a-email" className="label">Email</label>
        <input id="a-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
      </div>
      <div>
        <label htmlFor="a-pass" className="label">Parol</label>
        <input id="a-pass" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? 'Tekşirilmoqda…' : 'Kiriş'}
      </button>
    </form>
  )
}

const STATUS_TABS = [
  { id: 'pending', label: 'Kutilmoqda' },
  { id: 'approved', label: 'Tasdiqlangan' },
  { id: 'rejected', label: 'Rad etilgan' },
]

function Moderation({ onChange }) {
  const [status, setStatus] = useState('pending')
  const { status: load, data, error, reload } = useAsync(() => adminListMessages(status), [status])
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const act = async (id, fn) => {
    setBusyId(id)
    setActionError('')
    try {
      await fn()
      setConfirmId(null)
      reload()
      onChange()
    } catch (e) {
      setActionError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Fikrlar holati">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={status === t.id}
            onClick={() => setStatus(t.id)}
            className={`min-h-[44px] rounded-full px-5 text-[15px] font-medium ${status === t.id ? 'bg-tun text-white' : 'bg-qogoz text-siyoh/75 hover:text-siyoh'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && <div className="mt-4"><Notice tone="error">{actionError}</Notice></div>}

      <div className="mt-6">
        {load === 'loading' && <Loading label="Fikrlar yuklanmoqda" />}
        {load === 'error' && <ErrorState error={error} onRetry={reload} />}
        {load === 'ready' && data.length === 0 && (
          <EmptyState title={status === 'pending' ? 'Körib çiqiladigan fikr yöq' : 'Bu röyxat böş'}>
            {status === 'pending' ? 'Yangi fikrlar kelganda şu yerda paydo böladi.' : ''}
          </EmptyState>
        )}
        {load === 'ready' && data.length > 0 && (
          <ul className="space-y-4">
            {data.map((m) => (
              <li key={m.id} className="rounded-2xl border border-siyoh/15 p-5">
                <p className="text-lg leading-relaxed text-siyoh">
                  <span className="text-siyoh/50">Men Özbekiston bilan faxrlanaman, çunki </span>
                  {m.message}
                </p>
                <p className="mt-3 text-[15px] text-siyoh/65">
                  <span className="font-medium text-siyoh">{m.name}</span>, {regionName(m.region)} — {formatDate(m.created_at)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.status !== 'approved' && (
                    <button type="button" className="btn-green min-h-[44px]" disabled={busyId === m.id} onClick={() => act(m.id, () => adminSetStatus(m.id, 'approved'))}>
                      Tasdiqlaş
                    </button>
                  )}
                  {m.status !== 'rejected' && (
                    <button type="button" className="btn-outline min-h-[44px]" disabled={busyId === m.id} onClick={() => act(m.id, () => adminSetStatus(m.id, 'rejected'))}>
                      Rad etiş
                    </button>
                  )}
                  {confirmId === m.id ? (
                    <>
                      <button type="button" className="btn min-h-[44px] bg-qizil text-white" disabled={busyId === m.id} onClick={() => act(m.id, () => adminDeleteMessage(m.id))}>
                        Ha, butunlay öçiriş
                      </button>
                      <button type="button" className="btn-outline min-h-[44px]" onClick={() => setConfirmId(null)}>
                        Bekor qiliş
                      </button>
                    </>
                  ) : (
                    <button type="button" className="btn min-h-[44px] text-qizil hover:bg-qizil/[0.06]" onClick={() => setConfirmId(m.id)}>
                      Öçiriş
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function AdminStatsTab() {
  const pub = useAsync(fetchStats, [])
  const adm = useAsync(adminStats, [])

  if (pub.status === 'loading' || adm.status === 'loading') return <Loading label="Statistika yuklanmoqda" />
  if (pub.status === 'error') return <ErrorState error={pub.error} onRetry={pub.reload} />
  if (adm.status === 'error') return <ErrorState error={adm.error} onRetry={adm.reload} />

  const a = adm.data
  const daily = a.daily || []
  const dayMax = Math.max(1, ...daily.map((d) => d.count))

  return (
    <div className="space-y-14">
      <section>
        <h2 className="text-3xl text-tun">Bugun (Toşkent vaqti bilan)</h2>
        <dl className="mt-5 grid grid-cols-3 gap-6">
          {[
            ['Viktorina', a.today.quiz],
            ['Kartalar', a.today.cards],
            ['Yuborilgan fikrlar', a.today.messages],
          ].map(([label, n]) => (
            <div key={label} className="border-t-2 border-tun pt-3">
              <dt className="text-siyoh/70">{label}</dt>
              <dd className="font-display text-4xl font-semibold tabular-nums text-tun">{formatNumber(n)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-3xl text-tun">Sönggi 14 kun</h2>
        {daily.length === 0 ? (
          <p className="mt-3 text-siyoh/65">Bu davrda faollik qayd etilmagan.</p>
        ) : (
          <ul className="mt-5 space-y-2">
            {daily.map((d) => (
              <li key={d.day} className="grid grid-cols-[7.5rem_1fr_4rem] items-center gap-3 text-[15px]">
                <span className="tabular-nums text-siyoh/70">{d.day}</span>
                <span className="h-2.5 rounded-full bg-siyoh/[0.07]">
                  <span className="block h-full rounded-full bg-moviy" style={{ width: `${(d.count / dayMax) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{formatNumber(d.count)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <StatsView data={pub.data} />
    </div>
  )
}

function ContentTab() {
  const { status, data, error, reload } = useAsync(fetchContent, [])
  const [text, setText] = useState('')
  const [active, setActive] = useState(false)
  const [wallOpen, setWallOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!data) return
    setText(String(data.announcement?.text || ''))
    setActive(Boolean(data.announcement?.active))
    setWallOpen(data.wall_open?.value !== false)
  }, [data])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setResult(null)
    try {
      await adminSaveContent('announcement', { text: text.trim().slice(0, 200), active: active && text.trim().length > 0 })
      await adminSaveContent('wall_open', { value: wallOpen })
      setResult({ tone: 'success', text: 'Özgarişlar saqlandi.' })
    } catch (err) {
      setResult({ tone: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') return <Loading />
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />

  return (
    <form onSubmit={save} className="max-w-2xl space-y-8">
      <fieldset className="space-y-4">
        <legend className="font-display text-3xl font-semibold text-tun">E’lon satri</legend>
        <p className="text-siyoh/70">Sayt tepasida barça sahifalarda körinadigan qisqa xabar.</p>
        <div>
          <label htmlFor="ct-text" className="label">Matn (200 belgigaça)</label>
          <input id="ct-text" className="field" value={text} maxLength={200} onChange={(e) => setText(e.target.value)} placeholder="Masalan: 18-noyabr kuni soat 10:00 da bayram tadbiri jonli efirda" />
        </div>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[#062B44]" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span>E’lonni saytda körsatiş</span>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-3xl font-semibold text-tun">Faxr devori</legend>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[#062B44]" checked={wallOpen} onChange={(e) => setWallOpen(e.target.checked)} />
          <span>Yangi fikrlarni qabul qiliş</span>
        </label>
        <p className="text-sm text-siyoh/60">Öçirilsa, forma yopiladi va baza ham yangi fikrlarni qabul qilmaydi. Tasdiqlangan fikrlar körinişda qoladi.</p>
      </fieldset>

      {result && <Notice tone={result.tone}>{result.text}</Notice>}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Saqlanmoqda…' : 'Özgarişlarni saqlaş'}
      </button>
    </form>
  )
}

const TABS = [
  { id: 'moderation', label: 'Fikrlar' },
  { id: 'stats', label: 'Statistika' },
  { id: 'content', label: 'Kontent' },
]

function Dashboard({ email, onSignOut }) {
  const [tab, setTab] = useState('moderation')
  const counts = useAsync(adminStats, [])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-siyoh/15 pb-5">
        <p className="text-siyoh/70">
          Kirgan foydalanuvçi: <span className="font-medium text-siyoh">{email}</span>
        </p>
        <button type="button" className="btn-outline min-h-[44px]" onClick={onSignOut}>Çiqiş</button>
      </div>

      <nav className="mt-6 flex flex-wrap gap-6 border-b border-siyoh/15" aria-label="Boşqaruv bölimlari">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`-mb-px min-h-[48px] border-b-2 font-display text-2xl font-semibold ${tab === t.id ? 'border-qizil text-tun' : 'border-transparent text-siyoh/50 hover:text-siyoh'}`}
          >
            {t.label}
            {t.id === 'moderation' && counts.data?.pending > 0 && (
              <span className="ml-2 rounded-full bg-qizil px-2 py-0.5 align-middle font-sans text-sm text-white">{counts.data.pending}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === 'moderation' && <Moderation onChange={counts.reload} />}
        {tab === 'stats' && <AdminStatsTab />}
        {tab === 'content' && <ContentTab />}
      </div>
    </div>
  )
}

export default function Admin() {
  usePageMeta('Boşqaruv paneli', '', { noindex: true })
  const [state, setState] = useState({ status: 'loading' })

  const check = useCallback(() => {
    setState({ status: 'loading' })
    getAdminState()
      .then((s) => setState({ status: 'ready', ...s }))
      .catch((error) => setState({ status: 'error', error }))
  }, [])

  useEffect(() => {
    check()
  }, [check])

  const signOut = async () => {
    await adminSignOut()
    check()
  }

  return (
    <>
      <PageBand title="Boşqaruv paneli">Fikrlarni körib çiqiş, statistika va sayt kontenti.</PageBand>
      <section className="wrap py-12 sm:py-16">
        {!isConfigured && <ErrorState error={{ code: 'not_configured' }} />}
        {isConfigured && state.status === 'loading' && <Loading label="Tekşirilmoqda" />}
        {isConfigured && state.status === 'error' && <ErrorState error={state.error} onRetry={check} />}
        {isConfigured && state.status === 'ready' && !state.signedIn && <Login onDone={check} />}
        {isConfigured && state.status === 'ready' && state.signedIn && !state.isAdmin && (
          <div className="mx-auto max-w-md space-y-4">
            <Notice tone="error">
              {state.email} hisobida administrator huquqi yöq. Huquq berilişi uçun loyiha egasiga murojaat qiling.
            </Notice>
            <button type="button" className="btn-outline" onClick={signOut}>Boşqa hisob bilan kiriş</button>
          </div>
        )}
        {isConfigured && state.status === 'ready' && state.signedIn && state.isAdmin && <Dashboard email={state.email} onSignOut={signOut} />}
      </section>
    </>
  )
}
