import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PageBand } from '../components/Layout'
import RegionSelect from '../components/RegionSelect'
import ShareRow from '../components/ShareRow'
import { ConfigNotice, Notice } from '../components/States'
import { QUIZ, grade, shuffled } from '../data/quiz'
import { submitQuizResult } from '../lib/api'
import { drawDiploma, ensureFonts } from '../lib/canvasArt'
import { formatDate, usePageMeta } from '../lib/hooks'
import { regionName } from '../lib/regions'
import { cleanName, getProfile, saveProfile } from '../lib/session'
import { isConfigured } from '../lib/supabase'

const TOTAL = QUIZ.length

function Intro({ onStart }) {
  const profile = getProfile()
  const [name, setName] = useState(profile.name)
  const [region, setRegion] = useState(profile.region)

  const submit = (e) => {
    e.preventDefault()
    const n = name.trim()
    if (n.length < 2 || !region) return
    saveProfile({ name: n, region })
    onStart({ name: n, region })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
      <div>
        <h2 className="text-3xl text-tun sm:text-4xl">Boşlaşdan oldin</h2>
        <ul className="mt-5 space-y-3 text-siyoh/75">
          <li>{TOTAL} ta savol, har birida törtta javob varianti.</li>
          <li>Javob tanlangaç töğri variant va qisqa izoh körsatiladi.</li>
          <li>Vaqt çeklanmagan. Yakunda ball va iştirok diplomi beriladi.</li>
        </ul>
        <p className="mt-6 text-[15px] text-siyoh/60">
          Ismingiz faqat diplomga yoziladi va şu qurilmada qoladi. Serverga faqat hudud va ball yuboriladi.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <ConfigNotice />
        <div>
          <label htmlFor="q-name" className="label">Ism va familiya</label>
          <input
            id="q-name"
            className="field"
            value={name}
            onChange={(e) => setName(cleanName(e.target.value))}
            placeholder="Masalan: Dilnoza Karimova"
            autoComplete="name"
            minLength={2}
            maxLength={60}
            required
          />
        </div>
        <div>
          <label htmlFor="q-region" className="label">Hudud</label>
          <RegionSelect id="q-region" value={region} onChange={setRegion} />
        </div>
        <button type="submit" className="btn-primary w-full sm:w-auto">Viktorinani boşlaş</button>
      </form>
    </div>
  )
}

function Question({ item, index, onAnswer, onNext, picked }) {
  const answered = picked !== null
  const noteRef = useRef(null)

  useEffect(() => {
    if (answered) noteRef.current?.focus()
  }, [answered])

  return (
    <div>
      <div className="flex items-center justify-between text-[15px] text-siyoh/60">
        <p>
          Savol {index + 1} / {TOTAL}
        </p>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-siyoh/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={index + (answered ? 1 : 0)}
        aria-label="Viktorina bosqiçi"
      >
        <motion.div
          className="h-full rounded-full bg-moviy"
          animate={{ width: `${((index + (answered ? 1 : 0)) / TOTAL) * 100}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="mt-8 text-3xl leading-tight text-tun sm:text-4xl">{item.q}</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {item.options.map((opt, i) => {
              const isCorrect = i === item.correct
              const isPicked = i === picked
              let style = 'border-siyoh/20 hover:border-tun'
              if (answered && isCorrect) style = 'border-ormon bg-yaşil/10'
              else if (answered && isPicked) style = 'border-qizil bg-qizil/[0.06]'
              else if (answered) style = 'border-siyoh/10 text-siyoh/50'
              return (
                <li key={opt}>
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => onAnswer(i)}
                    className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-[17px] transition-colors ${style}`}
                  >
                    <span className="flex-1">{opt}</span>
                    {answered && isCorrect && <span className="text-sm font-semibold text-ormon">Töğri</span>}
                    {answered && isPicked && !isCorrect && <span className="text-sm font-semibold text-qizil">Notöğri</span>}
                  </button>
                </li>
              )
            })}
          </ul>

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl bg-qogoz p-5 sm:p-6"
            >
              <p ref={noteRef} tabIndex={-1} className="text-siyoh/85 outline-none">
                <span className="font-semibold text-tun">{picked === item.correct ? 'Töğri javob. ' : 'Töğri javob boşqa. '}</span>
                {item.note}
              </p>
              <button type="button" className="btn-primary mt-5" onClick={onNext}>
                {index + 1 === TOTAL ? 'Natijani köriş' : 'Keyingi savol'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Result({ player, score, onRestart }) {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [save, setSave] = useState(isConfigured ? 'saving' : 'off')
  const [saveError, setSaveError] = useState('')
  const sent = useRef(false)

  const serial = useMemo(() => {
    const part = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    return `BG-2026-${part}`
  }, [])

  const sendResult = () => {
    setSave('saving')
    submitQuizResult({ region: player.region, score })
      .then(() => setSave('saved'))
      .catch((e) => {
        setSave('error')
        setSaveError(e.message)
      })
  }

  useEffect(() => {
    if (!isConfigured || sent.current) return
    sent.current = true
    sendResult()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    ensureFonts().then(() => {
      if (cancelled || !canvasRef.current) return
      drawDiploma(canvasRef.current, {
        name: player.name,
        region: regionName(player.region),
        score,
        total: TOTAL,
        dateText: formatDate(new Date()),
        serial,
      })
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [player, score, serial])

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <p className="text-siyoh/60">Sizning natijangiz</p>
          <p className="mt-2 font-display text-8xl font-semibold leading-none text-tun">
            {score}
            <span className="text-4xl text-siyoh/40"> / {TOTAL}</span>
          </p>
          <p className="lead mt-5">{grade(score)}</p>

          <div className="mt-6 space-y-3">
            {save === 'saving' && <Notice>Natija saqlanmoqda…</Notice>}
            {save === 'saved' && <Notice tone="success">Natijangiz umumiy statistikaga qöşildi.</Notice>}
            {save === 'off' && <ConfigNotice />}
            {save === 'error' && (
              <Notice tone="error">
                Natija statistikaga qöşilmadi: {saveError}{' '}
                <button type="button" className="font-semibold underline" onClick={sendResult}>Qayta yuboriş</button>
              </Notice>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn-outline" onClick={onRestart}>Qayta topşiriş</button>
            <Link to="/karta" className="btn-outline">Tabrik kartasi yaratiş</Link>
          </div>
        </div>

        <div>
          <h2 className="text-3xl text-tun">Elektron iştirok diplomingiz</h2>
          <div className="mt-4 overflow-hidden rounded-xl shadow-[0_20px_50px_-20px_rgba(6,43,68,0.45)] ring-1 ring-siyoh/10">
            <canvas ref={canvasRef} className="block h-auto w-full" role="img" aria-label={`${player.name} nomiga yozilgan iştirok diplomi, natija ${score} / ${TOTAL}`} />
          </div>
          <div className="mt-5">
            <ShareRow
              canvasRef={canvasRef}
              filename="bayrogim-gururim-diplom.png"
              shareText={`Men «Bayroğim — ğururim» viktorinasida ${TOTAL} tadan ${score} ball töpladim. Siz ham sinab köring:`}
              path="/viktorina"
              disabled={!ready}
            />
          </div>
          <p className="mt-4 text-sm text-siyoh/55">
            Diplom esdalik uçun beriladi va rasmiy hujjat hisoblanmaydi.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Quiz() {
  usePageMeta('Bayroq viktorinasi', 'Davlat bayroği tarixi va ramzlari böyiça 15 savollik viktorina. Yakunda şaxsiy elektron iştirok diplomi beriladi.')
  const [stage, setStage] = useState('intro')
  const [player, setPlayer] = useState(null)
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)

  const start = (p) => {
    setPlayer(p)
    setQuestions(QUIZ.map(shuffled))
    setIndex(0)
    setPicked(null)
    setScore(0)
    setRound((r) => r + 1)
    setStage('play')
    window.scrollTo(0, 0)
  }

  const answer = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === questions[index].correct) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 === TOTAL) {
      setStage('result')
      window.scrollTo(0, 0)
    } else {
      setIndex((n) => n + 1)
      setPicked(null)
    }
  }

  return (
    <>
      <PageBand title="Bayroq viktorinasi">
        Davlat bayroği tarixi, tuzilişi va ramzlari böyiça bilimingizni sinang.
      </PageBand>
      <section className="wrap py-12 sm:py-16">
        {stage === 'intro' && <Intro onStart={start} />}
        {stage === 'play' && (
          <div className="mx-auto max-w-3xl">
            <Question item={questions[index]} index={index} picked={picked} onAnswer={answer} onNext={next} />
          </div>
        )}
        {stage === 'result' && <Result key={round} player={player} score={score} onRestart={() => start(player)} />}
      </section>
    </>
  )
}
