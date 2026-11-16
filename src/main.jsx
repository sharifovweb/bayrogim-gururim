import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import App from './App'
import './index.css'

// Körib çiqiş (preview) rejimi: sahifa boşqa sayt içida oçilganda manzil yöllari
// işlamaydi, şuning uçun marşrut oddiy #nom körinişida saqlanadi.
// Oddiy joylaşda (Vercel) BrowserRouter işlatiladi.
const PREVIEW = import.meta.env.VITE_PREVIEW === '1'

function HashSync() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const onHash = () => {
      const target = '/' + window.location.hash.replace(/^#/, '')
      navigate(target, { replace: true })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [navigate])
  useEffect(() => {
    const name = pathname.replace(/^\//, '')
    if (window.location.hash.replace(/^#/, '') !== name) {
      try {
        window.location.hash = name
      } catch {
        /* manzilni özgartirib bölmasa ham sahifa işlayveradi */
      }
    }
  }, [pathname])
  return null
}

const initial = '/' + (typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {PREVIEW ? (
      <MemoryRouter initialEntries={[initial]}>
        <HashSync />
        <App />
      </MemoryRouter>
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </React.StrictMode>,
)
