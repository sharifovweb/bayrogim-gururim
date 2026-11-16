import { useEffect, useRef, useState } from 'react'
import { PageBand } from '../components/Layout'
import RegionSelect from '../components/RegionSelect'
import ShareRow from '../components/ShareRow'
import { ConfigNotice } from '../components/States'
import { logCard } from '../lib/api'
import { TEMPLATES, drawCard, ensureFonts } from '../lib/canvasArt'
import { usePageMeta } from '../lib/hooks'
import { regionName } from '../lib/regions'
import { cleanName, getProfile, saveProfile } from '../lib/session'
import { isConfigured } from '../lib/supabase'

export default function Card() {
  usePageMeta('Şaxsiy tabrik kartasi', 'Ism va hududingizni kiriting, şablon tanlang va Davlat bayroği kuni bilan tabrik kartasini PNG şaklida yuklab oling.')
  const profile = getProfile()
  const [name, setName] = useState(profile.name)
  const [region, setRegion] = useState(profile.region)
  const [template, setTemplate] = useState('tun')
  const [fontsReady, setFontsReady] = useState(false)
  const [touched, setTouched] = useState(false)
  const canvasRef = useRef(null)
  const logged = useRef(new Set())

  useEffect(() => {
    ensureFonts().then(() => setFontsReady(true))
  }, [])

  useEffect(() => {
    if (!fontsReady || !canvasRef.current) return
    drawCard(canvasRef.current, { name, region: regionName(region), template })
  }, [fontsReady, name, region, template])

  const valid = name.trim().length >= 2 && Boolean(region)

  // Har bir (şablon + hudud) juftligi bir marta hisobga olinadi; ism serverga yuborilmaydi
  const onDownload = () => {
    saveProfile({ name: name.trim(), region })
    const key = `${template}:${region}`
    if (!isConfigured || logged.current.has(key)) return
    logged.current.add(key)
    logCard({ region, template }).catch(() => logged.current.delete(key))
  }

  return (
    <>
      <PageBand title="Şaxsiy tabrik kartasi">
        Ismingiz yozilgan bayram kartasini yarating va yaqinlaringizga yuboring.
      </PageBand>
      <section className="wrap grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
        <form className="order-2 space-y-6 lg:order-1" onSubmit={(e) => e.preventDefault()}>
          <ConfigNotice />
          <div>
            <label htmlFor="c-name" className="label">Ism va familiya</label>
            <input
              id="c-name"
              className="field"
              value={name}
              onChange={(e) => setName(cleanName(e.target.value))}
              onBlur={() => setTouched(true)}
              placeholder="Masalan: Jasur Aliyev"
              autoComplete="name"
              maxLength={60}
              aria-describedby="c-name-help"
            />
            <p id="c-name-help" className={`mt-1.5 text-sm ${touched && name.trim().length < 2 ? 'text-qizil' : 'text-siyoh/55'}`}>
              {touched && name.trim().length < 2 ? 'Ism kamida 2 ta harfdan iborat bölsin.' : 'Ism kartaga yoziladi va serverga yuborilmaydi.'}
            </p>
          </div>
          <div>
            <label htmlFor="c-region" className="label">Hudud</label>
            <RegionSelect id="c-region" value={region} onChange={setRegion} />
          </div>

          <fieldset>
            <legend className="label">Şablon</legend>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => {
                const active = t.id === template
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTemplate(t.id)}
                    className={`flex min-h-[56px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${active ? 'border-tun bg-qogoz' : 'border-siyoh/15 hover:border-siyoh/40'}`}
                  >
                    <span
                      className="h-8 w-8 shrink-0 rounded-full ring-1 ring-inset ring-siyoh/15"
                      style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
                      aria-hidden="true"
                    />
                    <span className="font-medium">{t.name}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div>
            <ShareRow
              canvasRef={canvasRef}
              filename="bayrogim-gururim-karta.png"
              shareText="Davlat bayroği qabul qilinganining 35 yilligi muborak! Öz kartangizni yarating:"
              path="/karta"
              onDownload={onDownload}
              disabled={!valid || !fontsReady}
            />
            {!valid && <p className="mt-3 text-sm text-siyoh/55">Yuklab oliş uçun ism va hududni kiriting.</p>}
          </div>
        </form>

        <div className="order-1 lg:order-2">
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl shadow-[0_30px_60px_-25px_rgba(6,43,68,0.55)] ring-1 ring-siyoh/10 lg:sticky lg:top-6">
            <canvas ref={canvasRef} width={1080} height={1350} className="block h-auto w-full bg-qogoz" role="img" aria-label="Tabrik kartasining körinişi" />
          </div>
        </div>
      </section>
    </>
  )
}
