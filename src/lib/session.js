// Qurilmadagi anonim sessiya. Şaxsni aniqlamaydi: tasodifiy UUID faqat
// takroriy yuborişlarni çeklaş va iştirokçilarni sanaş uçun işlatiladi.

const SESSION_KEY = 'bg_session'
const PROFILE_KEY = 'bg_profile'
const mem = {}

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return mem[key] ?? null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    mem[key] = value
  }
}

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export function getSessionId() {
  let id = read(SESSION_KEY)
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    id = uuid()
    write(SESSION_KEY, id)
  }
  return id
}

// Ism va hudud faqat şu qurilmada saqlanadi (formalarni qayta töldirmaslik uçun)
export function getProfile() {
  try {
    const p = JSON.parse(read(PROFILE_KEY) || '{}')
    return { name: typeof p.name === 'string' ? p.name : '', region: typeof p.region === 'string' ? p.region : '' }
  } catch {
    return { name: '', region: '' }
  }
}

export function saveProfile(profile) {
  write(PROFILE_KEY, JSON.stringify({ name: profile.name || '', region: profile.region || '' }))
}

export function cleanName(value) {
  return value.replace(/[<>{}[\]\\/|@#$%^*=+~`]/g, '').replace(/\s+/g, ' ').slice(0, 60)
}
