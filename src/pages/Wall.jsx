import { useEffect, useRef, useState } from 'react'
import { PageBand } from '../components/Layout'
import RegionSelect from '../components/RegionSelect'
import { EmptyState, ErrorState, Loading, Notice } from '../components/States'
import { fetchContent, fetchWall, submitPride } from '../lib/api'
import { formatDate, usePageMeta } from '../lib/hooks'
import { regionName } from '../lib/regions'
import { cleanName, getProfile, saveProfile } from '../lib/session'
import { isConfigured } from '../lib/supabase'

const PREFIX = 'Men Özbekiston bilan faxrlanaman, çunki'
const MAX = 240
const MIN = 10
const PAGE = 12
const LINK_RE = /(https?:\/\/|www\.|t\.me\/|@[a-z0-9_]{4,}|\+?\d[\d \-()]{8,}\d)/i

function PrideForm() {
  const profile = getProfile()
  const [name, setName] = useState(profile.name)
  const [region, setRegion] = useState(profile.region)
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [trap, setTrap] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(true)
  const openedAt = useRef(Date.now())

  useEffect(() => {
    if (!isConfigured) return
    fetchContent()
      .then((c) => setOpen(c.wall_open?.value !== false))
      .catch(() => {})
  }, [])

  const text = message.trim().replace(/\s+/g, ' ')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) return setError('Ismingizni kiriting.')
    if (!region) return setError('Hududni tanlang.')
    if (text.length < MIN) return setError(`Fikr kamida ${MIN} ta belgidan iborat bölsin.`)
    if (LINK_RE.test(`${name} ${text}`)) return setError('Fikrda havola, telefon raqami yoki foydalanuvçi nomi bölmasin.')
    if (!consent) return setError('Fikringiz ommaga körsatilişiga rozilik bering.')

    // Botlarga qarşi: yaşirin maydon töldirilgan yoki forma juda tez yuborilgan bölsa,
    // sörov serverga yuborilmaydi, lekin xabar bermaymiz.
    if (trap || Date.now() - openedAt.current < 3000) {
      setState('done')
      return
    }

    setState('sending')
    try {
      await submitPride({ name: name.trim(), region, message: text })
      saveProfile({ name: name.trim(), region })
      setState('done')
      setMessage('')
      setConsent(false)
    } catch (err) {
      setError(err.message)
      setState('idle')
    }
  }

  if (!isConfigured) {
    return <Notice>Fikr qabul qiliş ma’lumotlar bazasi ulangaç işga tuşadi.</Notice>
  }
  if (!open) {
    return <Notice>Hozirça fikr qabul qiliş töxtatilgan. Tasdiqlangan fikrlarni quyida öqişingiz mumkin.</Notice>
  }
  if (state === 'done') {
    return (
      <div className="space-y-4">
        <Notice tone="success">
          Fikringiz moderatorga yuborildi. Tasdiqlangaç devorda körinadi.
        </Notice>
        <button type="button" className="btn-outline" onClick={() => { setState('idle'); openedAt.current = Date.now() }}>
          Yana fikr yoziş
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="w-name" className="label">Ism va familiya</label>
          <input id="w-name" className="field" value={name} onChange={(e) => setName(cleanName(e.target.value))} autoComplete="name" maxLength={60} placeholder="Devorda şu ism körinadi" />
        </div>
        <div>
          <label htmlFor="w-region" className="label">Hudud</label>
          <RegionSelect id="w-region" value={region} onChange={setRegion} required={false} />
        </div>
      </div>

      <div>
        <label htmlFor="w-message" className="label">{PREFIX}…</label>
        <textarea
          id="w-message"
          className="field min-h-[130px] resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
          placeholder="jumlani öz sözlaringiz bilan davom ettiring"
          maxLength={MAX}
          aria-describedby="w-count"
        />
        <p id="w-count" className="mt-1.5 text-right text-sm text-siyoh/55">
          {message.length} / {MAX}
        </p>
      </div>

      {/* Botlar uçun tuzoq maydon: odamlarga körinmaydi */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Veb-sayt
          <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-[15px] text-siyoh/80">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0B5D2A]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Ismim, hududim va fikrim moderator tasdiğidan söng ommaga körsatilişiga roziman.</span>
      </label>

      {error && <Notice tone="error">{error}</Notice>}

      <button type="submit" className="btn-green w-full sm:w-auto" disabled={state === 'sending'}>
        {state === 'sending' ? 'Yuborilmoqda…' : 'Fikrni yuboriş'}
      </button>
    </form>
  )
}

function WallList() {
  const [region, setRegion] = useState('')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [more, setMore] = useState(false)
  const req = useRef(0)

  const load = (from, reset) => {
    const id = ++req.current
    if (reset) setStatus('loading')
    else setMore(true)
    fetchWall({ region, from, size: PAGE })
      .then((res) => {
        if (id !== req.current) return
        setItems((prev) => (reset ? res.items : [...prev, ...res.items]))
        setTotal(res.total)
        setStatus('ready')
      })
      .catch((e) => {
        if (id !== req.current) return
        setError(e)
        setStatus('error')
      })
      .finally(() => id === req.current && setMore(false))
  }

  useEffect(() => {
    load(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-4xl text-tun sm:text-5xl">Devordagi fikrlar</h2>
        <div className="w-full sm:w-72">
          <label htmlFor="w-filter" className="sr-only">Hudud böyiça saralaş</label>
          <RegionSelect id="w-filter" value={region} onChange={setRegion} required={false} placeholder="Barça hududlar" />
        </div>
      </div>

      <div className="mt-10">
        {status === 'loading' && <Loading label="Fikrlar yuklanmoqda" />}
        {status === 'error' && <ErrorState error={error} onRetry={() => load(0, true)} />}
        {status === 'ready' && items.length === 0 && (
          <EmptyState title={region ? 'Bu hududdan hali fikr yöq' : 'Devor hozirça böş'}>
            {region ? 'Boşqa hududni tanlang yoki şu hududdan birinçi fikrni siz yozing.' : 'Birinçi fikrni siz qoldiring — tasdiqlangaç şu yerda körinadi.'}
          </EmptyState>
        )}
        {status === 'ready' && items.length > 0 && (
          <>
            <ul className="columns-1 gap-8 sm:columns-2 lg:columns-3">
              {items.map((m) => (
                <li key={m.id} className="mb-8 break-inside-avoid border-t-2 border-tun pt-5">
                  <blockquote className="font-display text-[1.6rem] leading-snug text-siyoh">
                    «{PREFIX} {m.message}»
                  </blockquote>
                  <p className="mt-4 text-[15px] text-siyoh/65">
                    <span className="font-medium text-siyoh">{m.name}</span>, {regionName(m.region)}
                  </p>
                  <p className="text-sm text-siyoh/45">{formatDate(m.created_at)}</p>
                </li>
              ))}
            </ul>
            {items.length < total && (
              <div className="mt-4 text-center">
                <button type="button" className="btn-outline" disabled={more} onClick={() => load(items.length, false)}>
                  {more ? 'Yuklanmoqda…' : 'Yana körsatiş'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function Wall() {
  usePageMeta('Raqamli faxr devori', '«Men Özbekiston bilan faxrlanaman, çunki…» — fikringizni qoldiring va yurtdoşlarimiz fikrlarini öqing.')
  return (
    <>
      <PageBand title="Raqamli faxr devori">
        «{PREFIX}…» — jumlani davom ettiring.
      </PageBand>
      <section className="wrap grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 className="text-3xl text-tun sm:text-4xl">Fikringizni qoldiring</h2>
          <p className="mt-4 text-siyoh/70">
            Har bir fikr moderator tomonidan körib çiqiladi. Havola, reklama va haqoratli sözlar bölgan matnlar e’lon qilinmaydi.
          </p>
        </div>
        <PrideForm />
      </section>
      <section className="bg-qogoz">
        <div className="wrap py-14 sm:py-20">
          <WallList />
        </div>
      </section>
    </>
  )
}
