import { REGIONS } from '../lib/regions'

export default function RegionSelect({ id, value, onChange, required = true, placeholder = 'Hududni tanlang' }) {
  return (
    <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{placeholder}</option>
      {REGIONS.map((r) => (
        <option key={r.code} value={r.code}>
          {r.name}
        </option>
      ))}
    </select>
  )
}
