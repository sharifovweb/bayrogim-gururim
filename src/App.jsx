import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { Loading } from './components/States'
import Home from './pages/Home'

const Quiz = lazy(() => import('./pages/Quiz'))
const Card = lazy(() => import('./pages/Card'))
const Wall = lazy(() => import('./pages/Wall'))
const History = lazy(() => import('./pages/History'))
const Stats = lazy(() => import('./pages/Stats'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="wrap py-24"><Loading label="Sahifa yuklanmoqda" /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/viktorina" element={<Quiz />} />
          <Route path="/karta" element={<Card />} />
          <Route path="/faxr-devori" element={<Wall />} />
          <Route path="/tarix" element={<History />} />
          <Route path="/statistika" element={<Stats />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
