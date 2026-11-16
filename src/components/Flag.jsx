import { useEffect, useRef } from 'react'
import { FLAG, STARS, drawFlag, starPoints } from '../lib/flag'

const CRESCENT_PATH = (() => {
  const c = FLAG.crescent
  const dy = Math.sqrt(c.r * c.r - 2.5 * 2.5)
  const x = c.cx + 2.5
  return `M${x} ${c.cy + dy}A${c.r} ${c.r} 0 1 1 ${x} ${c.cy - dy}A${c.cutR} ${c.cutR} 0 0 0 ${x} ${c.cy + dy}Z`
})()

// Aniq ölçamli statik bayroq (SVG)
export function FlagSvg({ className = '', title = 'Özbekiston Respublikasi Davlat bayroği' }) {
  return (
    <svg viewBox={`0 0 ${FLAG.w} ${FLAG.h}`} className={className} role="img" aria-label={title}>
      {FLAG.bands.map((b) => (
        <rect key={b.y} x="0" y={b.y} width={FLAG.w} height={b.h + 0.05} fill={b.color} />
      ))}
      <path d={CRESCENT_PATH} fill="#fff" />
      {STARS.map((s) => (
        <polygon key={`${s.x}-${s.y}`} points={starPoints(s.x, s.y, FLAG.starR).map((p) => p.map((n) => n.toFixed(2)).join(',')).join(' ')} fill="#fff" />
      ))}
    </svg>
  )
}

// Hilpirayotgan bayroq (Canvas). Matoning tölqini dastadan uzoqlaşgan sari kuçayadi.
export function WavingFlag({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const SRC_W = 1200
    const src = document.createElement('canvas')
    src.width = SRC_W
    src.height = SRC_W / 2
    drawFlag(src.getContext('2d'), 0, 0, SRC_W)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    let visible = true

    const render = (t) => {
      raf = 0
      if (!w) return
      ctx.clearRect(0, 0, w, h)
      const poleW = Math.max(3, w * 0.008)
      const fw = w - poleW - w * 0.01
      const fh = fw / 2
      const top = (h - fh) / 2
      const amp = reduce ? 0 : fh * 0.055
      const step = Math.max(1, Math.round(dpr))
      const time = reduce ? 0 : t * 0.0016

      // dasta
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillRect(0, top - fh * 0.08, poleW, fh * 1.4)

      for (let x = 0; x < fw; x += step) {
        const p = x / fw
        const phase = p * 6.4 - time
        const dy = (Math.sin(phase) * amp + Math.sin(phase * 0.47 + 1.3) * amp * 0.55) * p
        const dx = poleW + x
        ctx.drawImage(src, p * SRC_W, 0, Math.max(1, (step / fw) * SRC_W), SRC_W / 2, dx, top + dy, step + 0.5, fh)
        const shade = Math.cos(phase) * 0.17 * p * (reduce ? 0 : 1)
        if (shade !== 0) {
          ctx.fillStyle = shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(4,30,48,${-shade})`
          ctx.fillRect(dx, top + dy, step + 0.5, fh)
        }
      }
      if (!reduce && visible) raf = requestAnimationFrame(render)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.width = Math.round(rect.width * dpr)
      h = canvas.height = Math.round(rect.height * dpr)
      if (!raf) raf = requestAnimationFrame(render)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(render)
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className={`block aspect-[2/1.3] w-full ${className}`}
      role="img"
      aria-label="Hilpirayotgan Özbekiston Respublikasi Davlat bayroği"
    />
  )
}
