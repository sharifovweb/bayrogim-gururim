// Özbekiston Respublikasi Davlat bayroği geometriyasi.
// Ölçamlar "Davlat bayroği töğrisida"gi Qonun (407-XII, 18.11.1991) böyiça, santimetrda:
// mato 250×125; har bir rangli en 40; qizil hoşiyalar 2,5; yangi oy diametri 30 doirada,
// dastadan 20 sm; yulduzlar diametri 6 doirada, oraliği 6; qatorlar 3 – 4 – 5.

export const FLAG = {
  w: 250,
  h: 125,
  blue: '#0099B5',
  white: '#FFFFFF',
  green: '#1EB53A',
  red: '#CE1126',
  bands: [
    { y: 0, h: 40, color: '#0099B5' },
    { y: 40, h: 2.5, color: '#CE1126' },
    { y: 42.5, h: 40, color: '#FFFFFF' },
    { y: 82.5, h: 2.5, color: '#CE1126' },
    { y: 85, h: 40, color: '#1EB53A' },
  ],
  crescent: { cx: 35, cy: 20, r: 15, cutCx: 40, cutCy: 20, cutR: 15 },
  starR: 3,
}

const COLS = [44, 56, 68, 80, 92]
const ROWS = [
  { y: 8, from: 2 },
  { y: 20, from: 1 },
  { y: 32, from: 0 },
]

export const STARS = ROWS.flatMap((row) => COLS.slice(row.from).map((x) => ({ x, y: row.y })))

export function starPoints(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.382
    const a = (-90 + i * 36) * (Math.PI / 180)
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)])
  }
  return pts
}

// Yangi oy konturi: taşqi va içki yoylar (ikkala doira radiusi 15, markazlari 5 sm farq qiladi)
const TIP = Math.acos(2.5 / 15)

export function crescentPath(ctx) {
  const c = FLAG.crescent
  ctx.beginPath()
  ctx.arc(c.cx, c.cy, c.r, TIP, Math.PI * 2 - TIP, false)
  ctx.arc(c.cutCx, c.cutCy, c.cutR, Math.PI + TIP, Math.PI - TIP, true)
  ctx.closePath()
}

// Faqat yangi oy va yulduzlar (istalgan fon ustida)
export function drawEmblem(ctx, x, y, width, fill = '#FFFFFF') {
  const s = width / FLAG.w
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  ctx.fillStyle = fill
  crescentPath(ctx)
  ctx.fill()
  for (const st of STARS) {
    const pts = starPoints(st.x, st.y, FLAG.starR)
    ctx.beginPath()
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

export function drawFlag(ctx, x, y, width) {
  const s = width / FLAG.w
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  for (const b of FLAG.bands) {
    ctx.fillStyle = b.color
    ctx.fillRect(0, b.y, FLAG.w, b.h + 0.05)
  }
  ctx.restore()
  drawEmblem(ctx, x, y, width)
}

// Nozik milliy naqsh: sakkiz qirrali yulduzlar panjarasi
export function drawPattern(ctx, w, h, color, alpha = 0.06, size = 90) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  const r = size * 0.36
  for (let cy = 0, row = 0; cy < h + size; cy += size, row++) {
    for (let cx = row % 2 ? size / 2 : 0; cx < w + size; cx += size) {
      for (const rot of [0, Math.PI / 4]) {
        ctx.beginPath()
        for (let i = 0; i < 4; i++) {
          const a = rot + (i * Math.PI) / 2
          const px = cx + r * Math.cos(a)
          const py = cy + r * Math.sin(a)
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
        }
        ctx.closePath()
        ctx.stroke()
      }
    }
  }
  ctx.restore()
}
