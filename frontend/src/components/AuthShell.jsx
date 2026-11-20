import { CheckCircle2, KanbanSquare, Users, BellRing } from 'lucide-react';

const FEATURES = [
  { icon: KanbanSquare, text: 'Drag-and-drop Kanban board', tone: 'from-rose-500 to-orange-500' },
  { icon: Users, text: 'Team leaders and member workloads', tone: 'from-teal-500 to-cyan-500' },
  { icon: BellRing, text: 'Automatic deadline notifications', tone: 'from-amber-400 to-orange-500' },
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.18) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      <div className="pointer-events-none absolute -left-24 -top-24 h-[30rem] w-[30rem] animate-float rounded-full bg-rose-500/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-amber-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-[30rem] w-[30rem] animate-float rounded-full bg-teal-500/30 blur-3xl" />

      <div className="relative hidden flex-1 flex-col justify-between p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-lg font-extrabold shadow-glow">A</div>
          <span className="text-xl font-bold tracking-tight">AgileFlow</span>
        </div>
        <div>
          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight">Plan it. Build it.<br /><span className="bg-gradient-to-r from-rose-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">Ship it together.</span></h2>
          <p className="mt-5 max-w-md text-lg text-slate-300">Break projects into stories and tasks, keep every teammate and deadline on track, all in one colourful workspace.</p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text, tone }) => (
              <li key={text} className="flex items-center gap-3 text-slate-100">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} shadow-lg`}><Icon className="h-5 w-5" /></span>{text}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex max-w-sm -space-x-2">
            {['AM', 'PN', 'JL', 'SR', 'DU'].map((n, i) => (
              <span key={n} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br text-xs font-bold ${['from-rose-500 to-orange-500', 'from-teal-500 to-cyan-500', 'from-amber-400 to-orange-500', 'from-sky-500 to-blue-500', 'from-pink-500 to-rose-500'][i]}`}>{n}</span>
            ))}
            <span className="flex h-10 items-center pl-5 text-sm text-slate-300">Teams already in sync</span>
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="h-4 w-4 text-teal-400" /> Team Project Management System</p>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-up rounded-3xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-400 font-extrabold text-white">A</div>
            <span className="font-bold text-slate-900">AgileFlow</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="mb-7 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
