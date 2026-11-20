export default function ProgressBar({ value = 0, showLabel = true }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all" style={{ width: `${value}%` }} />
      </div>
      {showLabel && <span className="w-9 text-right text-xs font-medium text-slate-600">{value}%</span>}
    </div>
  );
}
