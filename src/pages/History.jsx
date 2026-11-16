import { Link } from 'react-router-dom'
import { FlagSvg } from '../components/Flag'
import { PageBand } from '../components/Layout'
import { usePageMeta } from '../lib/hooks'

const COLORS = [
  {
    color: '#0099B5',
    name: 'Moviy rang',
    text: 'Mangu osmon va obihayot — hayot manbai bölgan suv ramzi. Rasmiy şarhlarda Amir Temur davlati bayroğining rangi ham moviy bölgani alohida qayd etiladi.',
  },
  {
    color: '#FFFFFF',
    ring: true,
    name: 'Oq rang',
    text: 'Muqaddas tinçlik ramzi. U poklik, beğuborlik va ezgu niyatni ifodalaydi.',
  },
  {
    color: '#1EB53A',
    name: 'Yaşil rang',
    text: 'Tabiatning yangilanişi ramzi. Köplab xalqlarda u navqironlik, umid va şodumonlik timsoli sanaladi.',
  },
  {
    color: '#CE1126',
    name: 'Qizil hoşiyalar',
    text: 'Vujudimizda jöşib oqayotgan hayotiy qudrat irmoqlarini anglatadi.',
  },
]

const SIZES = [
  ['Matoning uzunligi', '250 sm'],
  ['Matoning kengligi', '125 sm'],
  ['Moviy, oq va yaşil enlar', 'har biri 40 sm'],
  ['Qizil hoşiyalar', 'har biri 2,5 sm'],
  ['Yangi oy', 'diametri 30 sm doiraga siğadi, dastadan 20 sm masofada'],
  ['Yulduzlar', '12 ta, har biri diametri 6 sm doiraga siğadi, oraliği 6 sm'],
  ['Yulduzlar tartibi', 'yuqorida 3 ta, örtada 4 ta, pastda 5 ta'],
]

const LAW = [
  {
    title: 'Davlat suvereniteti ramzi',
    text: 'Qonunning 2-moddasiga köra Davlat bayroği Özbekiston Respublikasi davlat suverenitetining ramzidir.',
  },
  {
    title: 'Xalqaro munosabatlardagi timsol',
    text: 'Davlat bayroği xalqaro munosabatlarda Özbekiston Respublikasining timsoli böladi.',
  },
  {
    title: 'Hurmat qiliş burçi',
    text: 'Özbekiston fuqarolari va mamlakatda yaşayotgan boşqa şaxslar Davlat bayroğini hurmat qilişi şart.',
  },
  {
    title: 'Konstitutsiyaviy asos',
    text: 'Konstitutsiyaga köra Özbekiston Respublikasi qonun bilan tasdiqlanadigan davlat ramzlari — bayroği, gerbi va madhiyasiga ega.',
  },
]

const SOURCES = [
  { label: '«Özbekiston Respublikasining Davlat bayroği töğrisida»gi Qonun, 407-XII-son, 18.11.1991 — lex.uz', href: 'https://lex.uz/docs/-100122' },
  { label: 'Davlat ramzlari — Taşqi işlar vazirligi, gov.uz', href: 'https://gov.uz/oz/mfa/sections/view/14473' },
  { label: 'Davlat ramzlari — Özbekiston Respublikasi Prezidentining rasmiy veb-sayti', href: 'https://president.uz/oz/pages/view/symbols' },
]

function Schematic() {
  // Bayroq sxemasi: ölçam çiziqlari bilan
  return (
    <figure>
      <svg viewBox="-26 -16 302 162" className="w-full" role="img" aria-label="Davlat bayroğining ölçamlari körsatilgan sxemasi">
        <foreignObject x="0" y="0" width="250" height="125">
          <FlagSvg className="block h-full w-full" title="" />
        </foreignObject>
        <rect x="0" y="0" width="250" height="125" fill="none" stroke="#0D2233" strokeOpacity=".25" strokeWidth=".5" />
        <g stroke="#0D2233" strokeWidth=".5" fill="none">
          <path d="M0 -8H250M0 -11V-5M250 -11V-5" />
          <path d="M-8 0V125M-11 0H-5M-11 125H-5" />
          <path d="M258 0V40M255 0H261M255 40H261M258 42.5V82.5M255 42.5H261M255 82.5H261M258 85V125M255 85H261M255 125H261" />
        </g>
        <g fill="#0D2233" fontSize="6.5" fontFamily="Onest Variable, sans-serif">
          <text x="125" y="-10.5" textAnchor="middle">250 sm</text>
          <text x="-10" y="62.5" textAnchor="middle" transform="rotate(-90 -10 62.5)">125 sm</text>
          <text x="263" y="22.5">40</text>
          <text x="263" y="65">40</text>
          <text x="263" y="107.5">40</text>
        </g>
      </svg>
      <figcaption className="mt-3 text-sm text-siyoh/60">
        Ölçamlar Qonun matni böyiça. Tomonlar nisbati 2 : 1.
      </figcaption>
    </figure>
  )
}

export default function History() {
  usePageMeta('Davlat bayroği tarixi va ramzlari', 'Davlat bayroğining qabul qilinişi, tuzilişi va ölçamlari, ranglar, yangi oy va ön ikki yulduz ramzi hamda qonuniy asoslar.')
  return (
    <>
      <PageBand title="Davlat bayroği tarixi va ramzlari">
        Qabul qilinişi, tuzilişi, ramzlar ma’nosi va qonuniy asoslar — rasmiy manbalar asosida.
      </PageBand>

      <article>
        <section className="wrap grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-4xl text-tun sm:text-5xl">1991-yil 18-noyabr</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-siyoh/80">
              <p>
                Mustaqillik e’lon qilinganidan ikki yarim oy ötib, Özbekiston Respublikasi Oliy Kengaşi navbatdan taşqari ötkazilgan VII sessiyasida «Özbekiston Respublikasining Davlat bayroği töğrisida»gi Qonunni qabul qildi.
              </p>
              <p>
                Bayroq yurtimiz hududida qadimda mavjud bölgan davlatlar bilan tarixiy boğliqlikni anglatadi va xalqimizning milliy-madaniy an’analarini özida mujassam etadi. Öşandan buyon 18-noyabr — Davlat bayroği qabul qilingan kun.
              </p>
              <p>2026-yilda bu sanaga 35 yil töladi.</p>
            </div>
          </div>
          <div className="self-center">
            <FlagSvg className="w-full rounded-md shadow-[0_30px_60px_-25px_rgba(6,43,68,0.5)] ring-1 ring-siyoh/10" />
          </div>
        </section>

        <section className="bg-qogoz">
          <div className="wrap grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h2 className="text-4xl text-tun sm:text-5xl">Tuzilişi va ölçamlari</h2>
              <p className="lead mt-4">
                Bayroq — butun uzunligi böylab ötgan töq moviy, oq va töq yaşil rangli uçta endan iborat töğri törtburçak mato. Oq enning ikki çetidan qizil hoşiyalar ötgan.
              </p>
              <div className="mt-8">
                <Schematic />
              </div>
            </div>
            <dl className="self-start border-t border-siyoh/15">
              {SIZES.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[1fr_1.2fr] gap-4 border-b border-siyoh/15 py-3.5">
                  <dt className="text-siyoh/65">{k}</dt>
                  <dd className="font-medium text-siyoh">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="wrap py-14 sm:py-20">
          <h2 className="text-4xl text-tun sm:text-5xl">Ranglar ramzi</h2>
          <ul className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {COLORS.map((c) => (
              <li key={c.name} className="flex gap-5">
                <span
                  className={`mt-1 h-16 w-16 shrink-0 rounded-full ${c.ring ? 'ring-1 ring-inset ring-siyoh/20' : ''}`}
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-3xl text-tun">{c.name}</h3>
                  <p className="mt-2 leading-relaxed text-siyoh/75">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-tun text-white">
          <div className="naqsh">
            <div className="wrap grid gap-10 py-14 sm:py-20 md:grid-cols-2 md:gap-16">
              <div>
                <h2 className="text-4xl sm:text-5xl">Yangi oy</h2>
                <p className="mt-5 text-lg leading-relaxed text-white/80">
                  Navqiron yarim oy tasviri tarixiy an’analarimiz bilan boğliq. Ayni paytda u qölga kiritilgan mustaqilligimiz ramzidir. Yangi oy moviy enda, dastaga yaqin joyda, döng tomoni dastaga qaratib tasvirlanadi.
                </p>
              </div>
              <div>
                <h2 className="text-4xl sm:text-5xl">Ön ikki yulduz</h2>
                <p className="mt-5 text-lg leading-relaxed text-white/80">
                  Yulduzlar qadimdan ezgulik timsoli sanalgan. Bayroqdagi ön ikki yulduz tarixiy an’analarimiz va qadimgi yilnomamiz bilan boğliq bölib, xalqimiz madaniyatining qadimiyligi, uning komillikka va öz tuproğida saodatga intilişi ramzi sifatida tuşuniladi.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap py-14 sm:py-20">
          <h2 className="text-4xl text-tun sm:text-5xl">Qonuniy asoslar</h2>
          <p className="lead mt-4 max-w-3xl">
            Davlat bayroği Özbekiston Respublikasining 1991-yil 18-noyabrdagi 407-XII-sonli Qonuni bilan tasdiqlangan.
          </p>
          <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {LAW.map((l) => (
              <div key={l.title} className="border-t-2 border-tun pt-4">
                <dt className="font-display text-2xl font-semibold text-tun">{l.title}</dt>
                <dd className="mt-2 leading-relaxed text-siyoh/75">{l.text}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-14 text-2xl text-tun">Manbalar</h3>
          <ul className="mt-4 space-y-2">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center text-tun underline decoration-moviy underline-offset-4 hover:decoration-2">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link to="/viktorina" className="btn-primary">Bilimni viktorinada sinaş</Link>
            <Link to="/karta" className="btn-outline">Tabrik kartasi yaratiş</Link>
          </div>
        </section>
      </article>
    </>
  )
}
