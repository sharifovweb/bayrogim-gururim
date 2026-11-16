import { supabase, isConfigured } from './supabase'
import { getSessionId } from './session'

export class AppError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

const MESSAGES = {
  not_configured: 'Ma’lumotlar bazasi hali ulanmagan. Administrator Supabase sozlamalarini kiritişi kerak.',
  rate_limit: 'Juda köp uriniş böldi. Birozdan keyin qayta urinib köring.',
  blocked_content: 'Matnda havola, telefon raqami yoki reklama belgilari bor. Ularni olib taşlab, qayta yuboring.',
  duplicate: 'Bu fikrni avval yuborgansiz. U moderator körigida.',
  wall_closed: 'Hozirça fikr qabul qiliş töxtatilgan.',
  forbidden: 'Bu amal uçun administrator huquqi kerak.',
  network: 'Internet aloqasi uzildi. Ulanişni tekşirib, qayta urinib köring.',
  invalid_login: 'Email yoki parol notöğri.',
  unknown: 'Kutilmagan xatolik yuz berdi. Qayta urinib köring.',
}

function toAppError(error) {
  if (error instanceof AppError) return error
  const raw = `${error?.message || ''} ${error?.code || ''}`.toLowerCase()
  let code = 'unknown'
  if (raw.includes('rate_limit')) code = 'rate_limit'
  else if (raw.includes('blocked_content')) code = 'blocked_content'
  else if (raw.includes('duplicate')) code = 'duplicate'
  else if (raw.includes('wall_closed')) code = 'wall_closed'
  else if (raw.includes('forbidden') || raw.includes('42501') || raw.includes('permission denied')) code = 'forbidden'
  else if (raw.includes('invalid login')) code = 'invalid_login'
  else if (raw.includes('failed to fetch') || raw.includes('networkerror') || raw.includes('load failed')) code = 'network'
  return new AppError(code, MESSAGES[code])
}

function client() {
  if (!isConfigured) throw new AppError('not_configured', MESSAGES.not_configured)
  return supabase
}

async function run(builder) {
  try {
    const { data, error, count } = await builder
    if (error) throw error
    return { data, count }
  } catch (e) {
    throw toAppError(e)
  }
}

// --- Ommaviy amallar ------------------------------------------------------

export async function submitQuizResult({ region, score }) {
  await run(client().from('quiz_results').insert({ session_id: getSessionId(), region, score }))
}

export async function logCard({ region, template }) {
  await run(client().from('cards').insert({ session_id: getSessionId(), region, template }))
}

export async function submitPride({ name, region, message }) {
  await run(client().from('pride_messages').insert({ session_id: getSessionId(), name, region, message }))
}

export async function fetchWall({ region = '', from = 0, size = 12 } = {}) {
  let q = client()
    .from('pride_messages')
    .select('id, created_at, name, region, message', { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, from + size - 1)
  if (region) q = q.eq('region', region)
  const { data, count } = await run(q)
  return { items: data || [], total: count || 0 }
}

export async function fetchStats() {
  const { data } = await run(client().rpc('get_public_stats'))
  return data
}

export async function fetchContent() {
  const { data } = await run(client().from('site_content').select('key, value'))
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]))
}

// --- Administrator ---------------------------------------------------------

export async function adminSignIn(email, password) {
  try {
    const { error } = await client().auth.signInWithPassword({ email, password })
    if (error) throw error
  } catch (e) {
    throw toAppError(e)
  }
}

export async function adminSignOut() {
  if (isConfigured) await supabase.auth.signOut()
}

export async function getAdminState() {
  const sb = client()
  const { data } = await sb.auth.getSession()
  if (!data?.session) return { signedIn: false, isAdmin: false, email: '' }
  const { data: ok } = await run(sb.rpc('is_admin'))
  return { signedIn: true, isAdmin: ok === true, email: data.session.user.email || '' }
}

export async function adminListMessages(status) {
  const { data } = await run(
    client()
      .from('pride_messages')
      .select('id, created_at, name, region, message, status, moderated_at')
      .eq('status', status)
      .order('created_at', { ascending: status === 'pending' })
      .limit(200),
  )
  return data || []
}

export async function adminSetStatus(id, status) {
  await run(client().from('pride_messages').update({ status }).eq('id', id))
}

export async function adminDeleteMessage(id) {
  await run(client().from('pride_messages').delete().eq('id', id))
}

export async function adminStats() {
  const { data } = await run(client().rpc('get_admin_stats'))
  return data
}

export async function adminSaveContent(key, value) {
  await run(client().from('site_content').update({ value }).eq('key', key))
}
