import { initials } from '../utils/format';

const GRADIENTS = [
  'from-sky-400 to-blue-500', 'from-violet-400 to-purple-500', 'from-emerald-400 to-teal-500',
  'from-cyan-400 to-sky-500', 'from-lime-400 to-emerald-500', 'from-pink-300 to-violet-400', 'from-blue-400 to-violet-500',
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
