import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FlagSvg } from './Flag'
import { fetchContent } from '../lib/api'
import { isConfigured } from '../lib/supabase'

const NAV = [
  { to: '/viktorina', label: 'Viktorina' },
  { to: '/karta', label: 'Tabrik kartasi' },
  { to: '/faxr-devori', label: 'Faxr devori' },
  { to: '/tarix', label: 'Tarix' },
  { to: '/statistika', label: 'Statistika' },
]

function Announcement() {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!isConfigured) return
    fetchContent()
      .then((c) => c.announcement?.active && c.announcement.text && setText(String(c.announcement.text)))
      .catch(() => {})
  }, [])
  if (!text) return null
  return (
    <div className="bg-white text-center text-sm text-tun">
      <p className="wrap py-2">{text}</p>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = ({ isActive }) =>
    `rounded-full px-3.5 py-2 text-[15px] transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`

  return (
    <header className="relative z-40 bg-tun text-white">
      <a href="#asosiy" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-tun">
        Asosiy mazmunga ötiş
      </a>
      <Announcement />
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3" aria-label="Bayroğim — ğururim, boş sahifa">
          <FlagSvg className="h-6 w-12 rounded-[3px] ring-1 ring-white/20" title="" />
          <span className="font-display text-xl font-semibold tracking-wide">Bayroğim — ğururim</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy navigatsiya">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="-mr-2 flex h-12 w-12 items-center justify-center rounded-full lg:hidden"
          aria-expanded={open}
          aria-controls="mobil-menyu"
          aria-label={open ? 'Menyuni yopiş' : 'Menyuni oçiş'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-4 w-6">
            <span className={`absolute left-0 h-0.5 w-6 bg-white transition-transform duration-200 ${open ? 'top-[7px] rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 top-[7px] h-0.5 w-6 bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 h-0.5 w-6 bg-white transition-transform duration-200 ${open ? 'top-[7px] -rotate-45' : 'top-[14px]'}`} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobil-menyu"
            aria-label="Mobil navigatsiya"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-x-0 top-full overflow-hidden border-t border-white/10 bg-tun-900 shadow-2xl lg:hidden"
          >
            <ul className="wrap py-3">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    className={({ isActive }) =>
                      `flex min-h-[52px] items-center border-b border-white/10 font-display text-2xl ${isActive ? 'text-white' : 'text-white/75'}`
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-ormon text-white">
      <div className="naqsh">
        <div className="wrap grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-semibold">Bir bayroq ostida — bir xalq, bir Vatan, bir kelajak</p>
            <p className="mt-4 max-w-md text-white/75">
              Özbekiston Respublikasi Davlat bayroği qabul qilinganining 35 yilligiga bağişlangan oçiq loyiha.
            </p>
          </div>
          <nav aria-label="Bölimlar">
            <p className="font-semibold">Bölimlar</p>
            <ul className="mt-3 space-y-1">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="inline-flex min-h-[40px] items-center text-white/80 hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="font-semibold">Maxfiylik</p>
            <p className="mt-3 text-white/75">
              Viktorina va karta uçun kiritilgan ism serverga yuborilmaydi. Faxr devoriga faqat özingiz yozgan ism, hudud va fikr saqlanadi hamda ommaga körsatiladi.
            </p>
          </div>
        </div>
        <div className="border-t border-white/15">
          <div className="wrap flex flex-col gap-2 py-5 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
            <p>1991-yil 18-noyabr — 2026-yil 18-noyabr</p>
            <p>Bayroq ölçamlari va ramzlari Qonun matni asosida berilgan</p>
          </div>
          <p className="wrap pb-5 text-sm text-white/65">Uşbu platforma Farğona viloyati. Özbekiston tumani hokimligi tomonidan yaratildi.</p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout({ children }) {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="asosiy" className="flex-1">
        {children}
      </main>
      <div className="hoshiya" aria-hidden="true" />
      <Footer />
    </div>
  )
}

// Içki sahifalarning moviy sarlavha qismi
export function PageBand({ title, children }) {
  return (
    <>
      <section className="bg-tun text-white">
        <div className="naqsh">
          <div className="wrap py-10 sm:py-14">
            <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
            {children && <p className="mt-3 max-w-2xl text-lg text-white/75">{children}</p>}
          </div>
        </div>
      </section>
      <div className="hoshiya" aria-hidden="true" />
    </>
  )
}
