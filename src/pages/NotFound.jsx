import { Link } from 'react-router-dom'
import { PageBand } from '../components/Layout'
import { usePageMeta } from '../lib/hooks'

export default function NotFound() {
  usePageMeta('Sahifa topilmadi', '', { noindex: true })
  return (
    <>
      <PageBand title="Sahifa topilmadi">Manzil notöğri yozilgan yoki sahifa köçirilgan.</PageBand>
      <section className="wrap py-16">
        <Link to="/" className="btn-primary">Boş sahifaga qaytiş</Link>
      </section>
    </>
  )
}
