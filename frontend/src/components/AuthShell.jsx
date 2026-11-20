import { CheckCircle2, KanbanSquare, Users, BellRing } from 'lucide-react';

const FEATURES = [
  { icon: KanbanSquare, text: 'Drag-and-drop Kanban board', tone: 'from-sky-400 to-blue-400' },
  { icon: Users, text: 'Team leaders and member workloads', tone: 'from-emerald-400 to-teal-400' },
  { icon: BellRing, text: 'Automatic deadline notifications', tone: 'from-violet-400 to-purple-400' },
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-violet-50 to-emerald-50">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(rgba(56,130,246,.12) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      <div className="pointer-events-none absolute -left-24 -top-24 h-[30rem] w-[30rem] animate-float rounded-full bg-sky-200/70 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-violet-200/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-[30rem] w-[30rem] animate-float rounded-full bg-emerald-200/60 blur-3xl" />

      <div className="relative hidden flex-1 flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-400 text-lg font-extrabold text-white shadow-glow">A</div>
          <span className="text-xl font-bold tracking-tight text-slate-800">AgileFlow</span>
        </div>
        <div>
          <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-800">Plan it. Build it.<br /><span className="bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">Ship it together.</span></h2>
          <p className="mt-5 max-w-md text-lg text-slate-600">Break projects into stories and tasks, keep every teammate and deadline on track, all in one bright workspace.</p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text, tone }) => (
              <li key={text} className="flex items-center gap-3 font-medium text-slate-700">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}><Icon className="h-5 w-5" /></span>{text}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex max-w-sm -space-x-2">
            {['AM', 'PN', 'JL', 'SR', 'DU'].map((n, i) => (
              <span key={n} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-xs font-bold text-white ${['from-sky-400 to-blue-400', 'from-emerald-400 to-teal-400', 'from-violet-400 to-purple-400', 'from-cyan-400 to-sky-400', 'from-pink-300 to-violet-300'][i]}`}>{n}</span>
            ))}
            <span className="flex h-10 items-center pl-5 text-sm text-slate-500">Teams already in sync</span>
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Team Project Management System</p>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-up rounded-3xl border border-white bg-white/85 p-8 shadow-lift backdrop-blur-xl sm:p-10">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-400 font-extrabold text-white">A</div>
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
