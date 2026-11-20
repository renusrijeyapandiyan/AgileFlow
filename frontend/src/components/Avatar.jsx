import { initials } from '../utils/format';

const COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];

export default function Avatar({ name, size = 'h-8 w-8 text-xs' }) {
  const color = COLORS[(name || '').length % COLORS.length];
  return <span title={name} className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full font-semibold text-white ${color}`}>{initials(name)}</span>;
}
