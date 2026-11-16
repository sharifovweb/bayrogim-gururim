import { useCallback, useEffect, useRef, useState } from 'react'

const BASE_TITLE = 'Bayroğim — ğururim'

export function usePageMeta(title, description, { noindex = false } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Davlat bayroği qabul qilinganining 35 yilligi`
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    }
    let robots = document.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.setAttribute('name', 'robots')
        document.head.appendChild(robots)
      }
      robots.setAttribute('content', 'noindex, nofollow')
    } else if (robots) {
      robots.remove()
    }
  }, [title, description, noindex])
}

// status: 'loading' | 'ready' | 'error'
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const alive = useRef(true)

  const load = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    fn()
      .then((data) => alive.current && setState({ status: 'ready', data, error: null }))
      .catch((error) => alive.current && setState({ status: 'error', data: null, error }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    alive.current = true
    load()
    return () => {
      alive.current = false
    }
  }, [load])

  return { ...state, reload: load }
}

export const formatNumber = (n) => new Intl.NumberFormat('uz-UZ').format(n ?? 0).replace(/,/g, ' ')

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
export function formatDate(value) {
  const d = new Date(value)
  return `${d.getFullYear()}-yil ${d.getDate()}-${MONTHS[d.getMonth()]}`
}
