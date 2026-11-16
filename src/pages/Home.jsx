import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { WavingFlag } from '../components/Flag'
import { fetchStats, fetchWall } from '../lib/api'
import { isConfigured } from '../lib/supabase'
import { formatNumber, useAsync, usePageMeta } from '../lib/hooks'
import { regionName } from '../lib/regions'

function daysNote() {
  const now = new Date()
  const year = now.getFullYear()
  const today = new Date(year, now.getMonth(), now.getDate())
  const day = new Date(year, 10, 18)
  const diff = Math.round((day - today) / 86400000)
  if (diff === 0) return 'Bugun — Davlat bayroği qabul qilingan kun'
  if (diff > 0 && diff <= 60) return `Bayramgaça ${diff} kun qoldi`
  return ''
}

const WAYS = [
  {
    to: '/viktorina',
    title: 'Bayroq viktorinasi',
    text: '15 ta savol, har biridan keyin qisqa izoh. Yakunda ismingiz yozilgan elektron iştirok diplomini olasiz.',
    cta: 'Viktorinani boşlaş',
    bar: 'bg-moviy',
  },
  {
    to: '/karta',
    title: 'Şaxsiy tabrik kartasi',
    text: 'Ism va hududingizni kiriting, şablonni tanlang — tayyor kartani PNG şaklida yuklab oling yoki yaqinlaringizga ulaşing.',
    cta: 'Karta yaratiş',
    bar: 'bg-white ring-1 ring-inset ring-qizil',
  },
  {
    to: '/faxr-devori',
    title: 'Raqamli faxr devori',
    text: '«Men Özbekiston bilan faxrlanaman, çunki…» jumlasini davom ettiring. Fikringiz darhol devorda körinadi.',
    cta: 'Fikr qoldiriş',
    bar: 'bg-yaşil',
  },
]

const SYMBOLS = [
  { color: '#0099B5', name: 'Moviy', text: 'Mangu osmon va obihayot ramzi' },
  { color: '#FFFFFF', name: 'Oq', text: 'Tinçlik va poklik ramzi', ring: true },
  { color: '#1EB53A', name: 'Yaşil', text: 'Tabiatning yangilanişi' },
  { color: '#CE1126', name: 'Qizil hoşiyalar', text: 'Vujudimizdagi hayotiy qudrat irmoqlari' },
]

function LiveNumbers() {
  const { status, data } = useAsync(fetchStats, [])
  if (!isConfigured || status !== 'ready' || !data) return null
  const items = [
    { n: data.participants, label: 'iştirokçi' },
    { n: data.quiz_attempts, label: 'viktorina urinişi' },
    { n: data.cards, label: 'yaratilgan karta' },
    { n: data.messages, label: 'devordagi fikr' },
  ]
  if (!data.participants) {
    return (
      <p className="text-white/80">
        Hozirça heç kim iştirok etmagan. Birinçi bölib qatnaşing — hisob sizdan boşlanadi.
      </p>
    )
  }
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.label}>
          <dd className="font-display text-5xl font-semibold tabular-nums">{formatNumber(it.n)}</dd>
          <dt className="mt-1 text-white/70">{it.label}</dt>
        </div>
      ))}
    </dl>
  )
}

function LatestVoices() {
  const { status, data } = useAsync(() => fetchWall({ size: 3 }), [])
  if (!isConfigured || status !== 'ready' || !data?.items.length) return null
  return (
    <section className="bg-qogoz">
      <div className="wrap py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl text-tun sm:text-5xl">Faxr devoridan</h2>
          <Link to="/faxr-devori" className="btn-outline">Barça fikrlar</Link>
        </div>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {data.items.map((m) => (
            <li key={m.id} className="border-t-2 border-tun pt-5">
              <blockquote className="font-display text-2xl leading-snug text-siyoh">
                «Men Özbekiston bilan faxrlanaman, çunki {m.message}»
              </blockquote>
              <p className="mt-4 text-[15px] text-siyoh/65">
                {m.name}, {regionName(m.region)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function Home() {
  usePageMeta('', 'Özbekiston Respublikasi Davlat bayroği qabul qilinganining 35 yilligiga bağişlangan interaktiv platforma: viktorina, şaxsiy tabrik kartasi va raqamli faxr devori.')
  const reduce = useReducedMotion()
  const note = daysNote()
  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] },
  })

  return (
    <>
      <section className="relative overflow-hidden bg-tun text-white">
        <div className="naqsh">
          <div className="wrap grid items-center gap-8 pb-16 pt-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:pb-24 lg:pt-16">
            <motion.div {...rise(0)} className="order-1 lg:order-2">
              <WavingFlag />
            </motion.div>

            <div className="order-2 lg:order-1">
              <motion.p {...rise(0.15)} className="text-lg text-white/75">
                1991-yil 18-noyabr — Davlat bayroği qabul qilingan kun
              </motion.p>
              <motion.h1 {...rise(0.25)} className="mt-3 text-[3.4rem] leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
                Bayroğim&nbsp;— ğururim
              </motion.h1>
              <motion.p {...rise(0.35)} className="mt-6 max-w-xl font-display text-2xl leading-snug text-white/90 sm:text-3xl">
                Bir bayroq ostida — bir xalq, bir Vatan, bir kelajak
              </motion.p>
              <motion.p {...rise(0.45)} className="mt-5 max-w-xl text-white/75">
                2026-yil 18-noyabrda Özbekiston Respublikasi Davlat bayroği qabul qilinganiga 35 yil töladi. Bilimingizni sinang, tabrik kartasi yarating va faxringizni butun mamlakat bilan baham köring.
              </motion.p>
              <motion.div {...rise(0.55)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" className="btn-light" onClick={() => document.getElementById('iştirok')?.scrollIntoView({ behavior: 'smooth' })}>
                  Loyihada iştirok etiş
                </button>
                <Link to="/tarix" className="btn-outline-light">Bayroq tarixi</Link>
              </motion.div>
              {note && (
                <motion.p {...rise(0.65)} className="mt-6 inline-flex items-center gap-2 text-[15px] text-white/80">
                  <span className="h-2 w-2 rounded-full bg-yaşil" aria-hidden="true" />
                  {note}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="hoshiya" aria-hidden="true" />

      <section id="iştirok" className="scroll-mt-6 bg-white">
        <div className="wrap py-16 sm:py-24">
          <h2 className="max-w-2xl text-4xl text-tun sm:text-5xl">Iştirok etişning uç yöli</h2>
          <p className="lead mt-4 max-w-2xl">Röyxatdan ötiş şart emas. Istalgan biridan boşlang.</p>

          <ul className="mt-12 border-t border-siyoh/15">
            {WAYS.map((w) => (
              <li key={w.to} className="border-b border-siyoh/15">
                <Link to={w.to} className="group grid gap-4 py-8 md:grid-cols-[14px_1fr_auto] md:items-center md:gap-8">
                  <span className={`h-2 w-16 rounded-full md:h-20 md:w-2 ${w.bar}`} aria-hidden="true" />
                  <span>
                    <span className="block font-display text-3xl font-semibold text-tun sm:text-4xl">{w.title}</span>
                    <span className="mt-2 block max-w-2xl text-siyoh/70">{w.text}</span>
                  </span>
                  <span className="btn-primary group-hover:bg-tun-700">{w.cta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-qogoz">
        <div className="wrap grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            <h2 className="text-4xl text-tun sm:text-5xl">Har bir rangning öz ma’nosi bor</h2>
            <p className="lead mt-4">
              Bayroqdagi ranglar, yangi oy va ön ikki yulduz xalqimizning tarixiy an’analari bilan boğliq. Qonuniy asoslar va ölçamlar «Tarix» bölimida.
            </p>
            <Link to="/tarix" className="btn-outline mt-6">Ramzlar haqida öqiş</Link>
          </div>
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {SYMBOLS.map((s) => (
              <div key={s.name} className="flex gap-4">
                <span
                  className={`mt-1 h-12 w-12 shrink-0 rounded-full ${s.ring ? 'ring-1 ring-inset ring-siyoh/20' : ''}`}
                  style={{ backgroundColor: s.color }}
                  aria-hidden="true"
                />
                <div>
                  <dt className="font-display text-2xl font-semibold text-tun">{s.name}</dt>
                  <dd className="text-siyoh/70">{s.text}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-tun text-white">
        <div className="naqsh">
          <div className="wrap py-16 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-4xl sm:text-5xl">Loyiha raqamlarda</h2>
              <Link to="/statistika" className="btn-outline-light">Hududlar kesimi</Link>
            </div>
            <div className="mt-10">
              {isConfigured ? (
                <LiveNumbers />
              ) : (
                <p className="max-w-xl text-white/80">
                  Hisob ma’lumotlar bazasi ulangaç yuritiladi. Bu yerda faqat haqiqiy iştirokçilar soni körsatiladi.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <LatestVoices />
    </>
  )
}
