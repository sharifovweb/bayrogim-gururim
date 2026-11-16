export const REGIONS = [
  { code: 'qoraqalpogiston', name: 'Qoraqalpoğiston Respublikasi' },
  { code: 'andijon', name: 'Andijon viloyati' },
  { code: 'buxoro', name: 'Buxoro viloyati' },
  { code: 'fargona', name: 'Farğona viloyati' },
  { code: 'jizzax', name: 'Jizzax viloyati' },
  { code: 'xorazm', name: 'Xorazm viloyati' },
  { code: 'namangan', name: 'Namangan viloyati' },
  { code: 'navoiy', name: 'Navoiy viloyati' },
  { code: 'qashqadaryo', name: 'Qaşqadaryo viloyati' },
  { code: 'samarqand', name: 'Samarqand viloyati' },
  { code: 'sirdaryo', name: 'Sirdaryo viloyati' },
  { code: 'surxondaryo', name: 'Surxondaryo viloyati' },
  { code: 'toshkent_v', name: 'Toşkent viloyati' },
  { code: 'toshkent_sh', name: 'Toşkent şahri' },
]

const MAP = Object.fromEntries(REGIONS.map((r) => [r.code, r.name]))
export const regionName = (code) => MAP[code] || ''
