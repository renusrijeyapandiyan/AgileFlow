/** Decorative animated background: soft pastel blobs. Purely visual. */
export default function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-32 top-10 h-[28rem] w-[28rem] animate-float rounded-full bg-sky-200/60 blur-3xl" />
      <div className="absolute right-0 top-0 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-violet-200/60 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] animate-float rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="absolute -bottom-20 right-10 h-80 w-80 animate-float-slow rounded-full bg-cyan-200/50 blur-3xl" />
    </div>
  );
}
