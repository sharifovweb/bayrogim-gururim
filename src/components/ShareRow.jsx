import { useState } from 'react'
import { canvasToBlob, downloadBlob, shareImage, telegramShareUrl } from '../lib/canvasArt'
import { SITE_URL } from '../lib/supabase'

// Canvas'dagi rasmni yuklab oliş va ulaşiş tugmalari
export default function ShareRow({ canvasRef, filename, shareText, path = '/', onDownload, disabled }) {
  const [busy, setBusy] = useState(false)
  const [fallback, setFallback] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const url = `${SITE_URL}${path}`

  const withBlob = async (fn) => {
    setBusy(true)
    setError('')
    try {
      const blob = await canvasToBlob(canvasRef.current)
      await fn(blob)
    } catch (e) {
      if (e?.code === 'declined') return
      setError('Rasmni tayyorlab bölmadi. Sahifani yangilab, qayta urinib köring.')
    } finally {
      setBusy(false)
    }
  }

  const download = () =>
    withBlob(async (blob) => {
      await downloadBlob(blob, filename)
      onDownload?.()
    })

  const share = () =>
    withBlob(async (blob) => {
      const done = await shareImage(blob, filename, shareText, url)
      if (!done) setFallback(true)
      else onDownload?.()
    })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Havolani nusxalab bölmadi.')
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-primary" onClick={download} disabled={busy || disabled}>
          PNG yuklab oliş
        </button>
        <button type="button" className="btn-outline" onClick={share} disabled={busy || disabled}>
          Ulaşiş
        </button>
      </div>
      {fallback && (
        <div className="mt-4 rounded-xl border border-siyoh/15 bg-qogoz p-4">
          <p className="text-[15px] text-siyoh/75">
            Bu brauzer rasmni töğridan töğri ulaşa olmaydi. Rasmni yuklab oling va havola bilan birga yuboring.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <a className="btn-outline" href={telegramShareUrl(url, shareText)} target="_blank" rel="noopener noreferrer">
              Telegramda ulaşiş
            </a>
            <button type="button" className="btn-outline" onClick={copy}>
              {copied ? 'Havola nusxalandi' : 'Havolani nusxalaş'}
            </button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-[15px] text-qizil">{error}</p>}
    </div>
  )
}
