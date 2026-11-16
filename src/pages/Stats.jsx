import { Link } from 'react-router-dom'
import { PageBand } from '../components/Layout'
import { EmptyState, ErrorState, Loading } from '../components/States'
import { fetchStats } from '../lib/api'
import { formatNumber, useAsync, usePageMeta } from '../lib/hooks'
import { REGIONS } from '../lib/regions'

export function StatsView({ data }) {
  const totals = [
    { n: data.participants, label: 'Iştirokçilar', hint: 'kamida bitta amal bajargan qurilmalar' },
    { n: data.quiz_attempts, label: 'Viktorina urinişlari', hint: data.quiz_attempts ? `örtaça ball: ${String(data.quiz_average ?? 0).replace('.', ',')} / 15` : 'hali topşirilmagan' },
    { n: data.cards, label: 'Yaratilgan kartalar', hint: 'yuklab olingan yoki ulaşilgan' },
    { n: data.messages, label: 'Devordagi fikrlar', hint: 'moderator tasdiqlagan' },
  ]

  const dist = data.distribution || []
  const distMax = Math.max(1, ...dist.map((d) => d.count))

  const byCode = Object.fromEntries((data.regions || []).map((r) => [r.region, r]))
  const regions = REGIONS.map((r) => ({ ...r, ...(byCode[r.code] || { participants: 0, quiz: 0, cards: 0, messages: 0 }) })).sort(
    (a, b) => b.participants - a.participants,
  )
  const regionMax = Math.max(1, ...regions.map((r) => r.participants))

  return (
    <div className="space-y-16">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {totals.map((t) => (
          <div key={t.label} className="border-t-2 border-tun pt-4">
            <dt className="text-siyoh/70">{t.label}</dt>
            <dd className="mt-1 font-display text-5xl font-semibold tabular-nums text-tun sm:text-6xl">{formatNumber(t.n)}</dd>
            <dd className="mt-1 text-sm text-siyoh/55">{t.hint}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="st-quiz">
        <h2 id="st-quiz" className="text-3xl text-tun sm:text-4xl">Viktorina natijalari</h2>
        {data.quiz_attempts ? (
          <>
            <p className="mt-2 text-siyoh/70">
              Ballar böyiça taqsimot. 15 tadan 15 ball töplaganlar: {formatNumber(data.quiz_perfect)} ta.
            </p>
            <div className="mt-8 overflow-x-auto">
              <ol className="flex h-56 min-w-[32rem] items-end gap-1.5 sm:gap-2" aria-label="Ballar taqsimoti">
                {dist.map((d) => (
                  <li key={d.score} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-xs tabular-nums text-siyoh/60">{d.count ? formatNumber(d.count) : ''}</span>
                    <span
                      className={`w-full rounded-t-[4px] ${d.score >= 13 ? 'bg-ormon' : 'bg-moviy'}`}
                      style={{ height: `${Math.max(d.count ? 3 : 0.5, (d.count / distMax) * 78)}%` }}
                      title={`${d.score} ball — ${d.count} ta`}
                    />
                    <span className="text-sm tabular-nums text-siyoh/70">{d.score}</span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-2 text-sm text-siyoh/55">Gorizontal öq — töplangan ball, ustun balandligi — urinişlar soni.</p>
          </>
        ) : (
          <div className="mt-6">
            <EmptyState title="Viktorinani hali heç kim topşirmagan" action={<Link to="/viktorina" className="btn-primary">Birinçi bölib topşiriş</Link>} />
          </div>
        )}
      </section>

      <section aria-labelledby="st-regions">
        <h2 id="st-regions" className="text-3xl text-tun sm:text-4xl">Hududlar kesimida faollik</h2>
        <p className="mt-2 text-siyoh/70">Iştirokçi körsatgan hudud böyiça. Barça 14 hudud körsatilgan.</p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-tun text-sm text-siyoh/65">
                <th scope="col" className="py-3 pr-4 font-medium">Hudud</th>
                <th scope="col" className="w-[34%] py-3 pr-4 font-medium">Iştirokçilar</th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">Viktorina</th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">Kartalar</th>
                <th scope="col" className="py-3 text-right font-medium">Fikrlar</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.code} className="border-b border-siyoh/10">
                  <th scope="row" className="py-3 pr-4 font-medium text-siyoh">{r.name}</th>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 rounded-full bg-siyoh/[0.07]">
                        <div className="h-full rounded-full bg-moviy" style={{ width: `${(r.participants / regionMax) * 100}%` }} />
                      </div>
                      <span className="w-14 text-right tabular-nums">{formatNumber(r.participants)}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-siyoh/75">{formatNumber(r.quiz)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-siyoh/75">{formatNumber(r.cards)}</td>
                  <td className="py-3 text-right tabular-nums text-siyoh/75">{formatNumber(r.messages)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default function Stats() {
  usePageMeta('Statistika', 'Loyiha iştirokçilari soni, viktorina natijalari, yaratilgan kartalar va hududlar kesimidagi faollik — haqiqiy ma’lumotlar asosida.')
  const { status, data, error, reload } = useAsync(fetchStats, [])

  return (
    <>
      <PageBand title="Statistika">
        Barça raqamlar bevosita ma’lumotlar bazasidan olinadi. Taxminiy yoki yaxlitlangan körsatkiçlar yöq.
      </PageBand>
      <section className="wrap py-12 sm:py-16">
        {status === 'loading' && <Loading label="Statistika yuklanmoqda" />}
        {status === 'error' && <ErrorState error={error} onRetry={reload} />}
        {status === 'ready' && data && !data.participants && (
          <EmptyState
            title="Hali iştirokçilar yöq"
            action={<Link to="/" className="btn-primary">Loyihada iştirok etiş</Link>}
          >
            Birinçi viktorina, karta yoki fikrdan söng raqamlar şu yerda paydo böladi.
          </EmptyState>
        )}
        {status === 'ready' && data?.participants > 0 && (
          <>
            <StatsView data={data} />
            <div className="mt-12 flex flex-wrap items-center gap-4 text-sm text-siyoh/55">
              <button type="button" className="btn-outline" onClick={reload}>Yangilaş</button>
              <p>
                Iştirokçi — viktorina topşirgan, karta yaratgan yoki fikr yuborgan qurilma. Şaxsiy ma’lumotlar statistikada işlatilmaydi.
              </p>
            </div>
          </>
        )}
      </section>
    </>
  )
}
