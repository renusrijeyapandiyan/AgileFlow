// Colourful accents used across cards (stable per id)
export const ACCENTS = [
  { grad: 'from-rose-500 via-orange-500 to-amber-400', soft: 'bg-rose-100 text-rose-700', dot: '#f43f5e' },
  { grad: 'from-teal-500 via-emerald-500 to-lime-400', soft: 'bg-teal-100 text-teal-700', dot: '#14b8a6' },
  { grad: 'from-sky-500 via-cyan-500 to-teal-400', soft: 'bg-sky-100 text-sky-700', dot: '#0ea5e9' },
  { grad: 'from-amber-500 via-orange-500 to-rose-500', soft: 'bg-amber-100 text-amber-700', dot: '#f59e0b' },
  { grad: 'from-fuchsia-500 via-pink-500 to-rose-400', soft: 'bg-pink-100 text-pink-700', dot: '#ec4899' },
  { grad: 'from-cyan-500 via-blue-500 to-sky-400', soft: 'bg-cyan-100 text-cyan-700', dot: '#06b6d4' },
];
export const accent = (id = 0) => ACCENTS[Math.abs(Number(id) || 0) % ACCENTS.length];
