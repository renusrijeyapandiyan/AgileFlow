// Soft, colourful accents used across cards (stable per id)
export const ACCENTS = [
  { grad: 'from-sky-400 via-blue-400 to-violet-400', soft: 'bg-sky-100 text-sky-700', dot: '#38bdf8' },
  { grad: 'from-emerald-400 via-teal-400 to-cyan-400', soft: 'bg-emerald-100 text-emerald-700', dot: '#34d399' },
  { grad: 'from-violet-400 via-purple-400 to-fuchsia-300', soft: 'bg-violet-100 text-violet-700', dot: '#a78bfa' },
  { grad: 'from-cyan-400 via-sky-400 to-blue-400', soft: 'bg-cyan-100 text-cyan-700', dot: '#22d3ee' },
  { grad: 'from-lime-300 via-emerald-300 to-teal-400', soft: 'bg-lime-100 text-lime-700', dot: '#a3e635' },
  { grad: 'from-pink-300 via-violet-300 to-sky-300', soft: 'bg-pink-100 text-pink-700', dot: '#f9a8d4' },
];
export const accent = (id = 0) => ACCENTS[Math.abs(Number(id) || 0) % ACCENTS.length];
