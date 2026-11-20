export default function ProgressBar({ value = 0, showLabel = true, height = 'h-2.5' }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${height} flex-1 overflow-hidden rounded-full bg-slate-100`}>
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 via-orange-500 to-amber-500 transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
      {showLabel && <span className="w-10 text-right text-xs font-bold text-slate-600">{value}%</span>}
    </div>
  );
}
