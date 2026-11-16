// Tabrik kartasi va iştirok diplomini HTML Canvas'da çiziş.
import { FLAG, drawEmblem, drawFlag, drawPattern } from './flag'

const DISPLAY = '"Cormorant Garamond", Georgia, serif'
const SANS = '"Onest Variable", system-ui, sans-serif'

export const CARD_SIZE = { w: 1080, h: 1350 }
export const DIPLOMA_SIZE = { w: 1600, h: 1131 }

export const TEMPLATES = [
  { id: 'tun', name: 'Moviy tun', swatch: ['#062B44', '#0099B5'] },
  { id: 'uchrang', name: 'Uç rang', swatch: ['#0099B5', '#1EB53A'] },
  { id: 'oq', name: 'Oq sahifa', swatch: ['#FFFFFF', '#CE1126'] },
  { id: 'yaşil', name: 'Yaşil vodiy', swatch: ['#0B5D2A', '#1EB53A'] },
]

export async function ensureFonts() {
  if (!document.fonts?.load) return
  try {
    await Promise.all([
      document.fonts.load(`600 80px ${DISPLAY}`),
      document.fonts.load(`700 80px ${DISPLAY}`),
      document.fonts.load(`500 30px ${SANS}`),
    ])
  } catch {
    /* zaxira şriftlar bilan çiziladi */
  }
}

function font(ctx, weight, size, family) {
  ctx.font = `${weight} ${size}px ${family}`
}

// Matn kenglikka siğmagunça şriftni kiçraytiradi
function fitText(ctx, text, weight, size, family, maxWidth, minSize = 28) {
  let s = size
  font(ctx, weight, s, family)
  while (ctx.measureText(text).width > maxWidth && s > minSize) {
    s -= 2
    font(ctx, weight, s, family)
  }
  return s
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function paragraph(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = wrapLines(ctx, text, maxWidth)
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
  return y + lines.length * lineHeight
}

function hairlines(ctx, x, y, width, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, 4)
}

function framedFlag(ctx, cx, y, width) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.28)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 18
  ctx.fillStyle = '#fff'
  ctx.fillRect(cx - width / 2, y, width, width / 2)
  ctx.restore()
  drawFlag(ctx, cx - width / 2, y, width)
}

const GREETING = 'Özbekiston Respublikasi Davlat bayroği qabul qilinganining 35 yilligi bilan samimiy tabriklayman!'
const SLOGAN = 'Bir bayroq ostida — bir xalq, bir Vatan, bir kelajak'

function solidCard(ctx, W, H, t, name, region) {
  const themes = {
    tun: { bg: ['#0A3D5C', '#041E30'], fg: '#FFFFFF', soft: 'rgba(255,255,255,0.72)', pattern: '#FFFFFF', alpha: 0.07 },
    yaşil: { bg: ['#0E6B32', '#07421D'], fg: '#FFFFFF', soft: 'rgba(255,255,255,0.75)', pattern: '#FFFFFF', alpha: 0.07 },
    oq: { bg: ['#FFFFFF', '#F1F6F6'], fg: '#062B44', soft: 'rgba(13,34,51,0.68)', pattern: '#0099B5', alpha: 0.09 },
  }[t]

  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, themes.bg[0])
  g.addColorStop(1, themes.bg[1])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  drawPattern(ctx, W, H, themes.pattern, themes.alpha, 120)

  framedFlag(ctx, W / 2, 120, 620)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = themes.soft
  font(ctx, 500, 34, SANS)
  ctx.fillText('18-noyabr — Davlat bayroği qabul qilingan kun', W / 2, 530)

  ctx.fillStyle = themes.fg
  font(ctx, 700, 104, DISPLAY)
  ctx.fillText('Bayroğim —', W / 2, 660)
  ctx.fillText('ğururim', W / 2, 765)

  hairlines(ctx, W / 2 - 60, 808, 120, FLAG.red)

  ctx.fillStyle = themes.soft
  font(ctx, 400, 36, SANS)
  const endY = paragraph(ctx, GREETING, W / 2, 890, 800, 52)

  ctx.fillStyle = themes.fg
  const size = fitText(ctx, name, 600, 84, DISPLAY, 900, 44)
  ctx.fillText(name, W / 2, Math.max(endY + 80, 1090) + size * 0.1)
  if (region) {
    ctx.fillStyle = themes.soft
    font(ctx, 500, 34, SANS)
    ctx.fillText(region, W / 2, Math.max(endY + 80, 1090) + 62)
  }

  ctx.fillStyle = themes.soft
  font(ctx, 600, 40, DISPLAY)
  ctx.fillText(SLOGAN, W / 2, H - 70)
}

function tribandCard(ctx, W, H, name, region) {
  const top = 500
  const line = 14
  const mid = 400
  ctx.fillStyle = FLAG.blue
  ctx.fillRect(0, 0, W, top)
  ctx.fillStyle = FLAG.red
  ctx.fillRect(0, top, W, line)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, top + line, W, mid)
  ctx.fillStyle = FLAG.red
  ctx.fillRect(0, top + line + mid, W, line)
  ctx.fillStyle = FLAG.green
  ctx.fillRect(0, top + line * 2 + mid, W, H)

  // timsol moviy enda, bayroqdagi kabi dasta tomonda
  drawEmblem(ctx, 30, 40, 1150)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#fff'
  font(ctx, 700, 96, DISPLAY)
  ctx.fillText('Bayroğim — ğururim', 80, 380)
  font(ctx, 500, 34, SANS)
  ctx.fillText('1991-yil 18-noyabr — 2026-yil 18-noyabr', 80, 440)

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(13,34,51,0.7)'
  font(ctx, 400, 35, SANS)
  const endY = paragraph(ctx, GREETING, W / 2, top + line + 90, 860, 50)

  ctx.fillStyle = '#062B44'
  const size = fitText(ctx, name, 600, 84, DISPLAY, 920, 44)
  ctx.fillText(name, W / 2, endY + 80 + size * 0.1)
  if (region) {
    ctx.fillStyle = 'rgba(13,34,51,0.7)'
    font(ctx, 500, 32, SANS)
    ctx.fillText(region, W / 2, endY + 138)
  }

  ctx.fillStyle = '#fff'
  font(ctx, 600, 58, DISPLAY)
  const sloganY = top + line * 2 + mid + 150
  ctx.fillText('Bir bayroq ostida —', W / 2, sloganY)
  ctx.fillText('bir xalq, bir Vatan, bir kelajak', W / 2, sloganY + 74)
  font(ctx, 500, 30, SANS)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText('Davlat bayroği qabul qilinganining 35 yilligi', W / 2, H - 70)
}

export function drawCard(canvas, { name, region, template }) {
  const { w: W, h: H } = CARD_SIZE
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)
  const shown = name.trim() || 'Ismingiz'
  if (template === 'uchrang') tribandCard(ctx, W, H, shown, region)
  else solidCard(ctx, W, H, template, shown, region)
}

export function drawDiploma(canvas, { name, region, score, total, dateText, serial }) {
  const { w: W, h: H } = DIPLOMA_SIZE
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, H)
  drawPattern(ctx, W, H, '#0099B5', 0.07, 130)

  // Bayroq tuzilişini takrorlovçi hoshiya: moviy – qizil – oq – qizil – yaşil
  const band = 46
  ctx.fillStyle = '#062B44'
  ctx.fillRect(0, 0, W, band * 3.2)
  drawPattern(ctx, W, band * 3.2, '#FFFFFF', 0.08, 90)
  ctx.fillStyle = FLAG.red
  ctx.fillRect(0, band * 3.2, W, 8)
  ctx.fillStyle = FLAG.red
  ctx.fillRect(0, H - band * 1.6 - 8, W, 8)
  ctx.fillStyle = '#0B5D2A'
  ctx.fillRect(0, H - band * 1.6, W, band * 1.6)

  drawFlag(ctx, 90, 38, 150)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#fff'
  font(ctx, 600, 46, DISPLAY)
  ctx.fillText('Bayroğim — ğururim', 270, 78)
  font(ctx, 400, 24, SANS)
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  ctx.fillText('Davlat bayroği qabul qilinganining 35 yilligiga bağişlangan viktorina', 270, 116)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#062B44'
  font(ctx, 700, 120, DISPLAY)
  ctx.fillText('Iştirok diplomi', W / 2, 340)

  ctx.fillStyle = 'rgba(13,34,51,0.65)'
  font(ctx, 400, 32, SANS)
  ctx.fillText('Uşbu elektron diplom bilan taqdirlanadi', W / 2, 420)

  ctx.fillStyle = '#0D2233'
  const size = fitText(ctx, name, 600, 110, DISPLAY, W - 320, 54)
  ctx.fillText(name, W / 2, 560)
  const nameWidth = Math.min(ctx.measureText(name).width + 120, W - 240)
  ctx.fillStyle = FLAG.red
  ctx.fillRect(W / 2 - nameWidth / 2, 560 + size * 0.28, nameWidth, 4)

  ctx.fillStyle = 'rgba(13,34,51,0.7)'
  font(ctx, 500, 30, SANS)
  if (region) ctx.fillText(region, W / 2, 660)

  ctx.fillStyle = '#0D2233'
  font(ctx, 400, 34, SANS)
  paragraph(
    ctx,
    `«Bayroğim — ğururim» viktorinasida iştirok etib, ${total} ta savoldan ${score} tasiga töğri javob berdi.`,
    W / 2,
    760,
    1150,
    52,
  )

  ctx.fillStyle = 'rgba(13,34,51,0.6)'
  font(ctx, 400, 24, SANS)
  ctx.textAlign = 'left'
  ctx.fillText(`Sana: ${dateText}`, 90, H - band * 1.6 - 50)
  ctx.textAlign = 'right'
  ctx.fillText(`Diplom raqami: ${serial}`, W - 90, H - band * 1.6 - 50)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  font(ctx, 600, 34, DISPLAY)
  ctx.fillText('Bir bayroq ostida — bir xalq, bir Vatan, bir kelajak', W / 2, H - 26)
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG yaratilmadi'))), 'image/png')
  })
}

export async function downloadBlob(blob, filename) {
  // Sahifa Claude içida körib çiqilayotgan bölsa, fayl mezbon oynasi orqali saqlanadi
  if (window.claude?.use) {
    const downloads = await window.claude.use('downloads')
    if (downloads) {
      await downloads.save({ filename, data: blob })
      return
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

// Qurilmaning ulaşiş oynasi orqali rasmni ulaşadi; imkon bölmasa false qaytaradi
export async function shareImage(blob, filename, text, url) {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Bayroğim — ğururim', text: `${text} ${url}` })
      return true
    } catch (e) {
      if (e?.name === 'AbortError') return true
    }
  }
  return false
}

export const telegramShareUrl = (url, text) =>
  `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
