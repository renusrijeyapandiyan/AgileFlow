import { initials } from '../utils/format';

const GRADIENTS = [
  'from-teal-500 to-orange-600', 'from-sky-500 to-teal-600', 'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-amber-500 to-teal-600', 'from-cyan-500 to-blue-600',
];

const hash = (s = '') => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function Avatar({ name, size = 'h-8 w-8 text-xs', ring = false }) {
  const g = GRADIENTS[hash(name) % GRADIENTS.length];
  return (
    <span title={name} className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${g} font-semibold text-white shadow-sm ${ring ? 'ring-4 ring-white' : ''}`}>
      {initials(name)}
    </span>
  );
}
