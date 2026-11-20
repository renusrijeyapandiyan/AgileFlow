export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 font-bold">A</div><span className="text-xl font-semibold">AgileFlow</span></div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Ship faster with<br />a team that’s in sync.</h2>
          <p className="mt-4 max-w-md text-slate-400">Plan projects, break them into user stories and tasks, and move work across the Kanban board — with automatic deadline alerts.</p>
        </div>
        <p className="text-sm text-slate-500">Team Project Management System</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
