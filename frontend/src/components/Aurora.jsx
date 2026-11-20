/** Decorative animated background: soft colour blobs + faint grid. Purely visual. */
export default function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      <div className="absolute -left-32 top-10 h-[28rem] w-[28rem] animate-float rounded-full bg-rose-300/40 blur-3xl" />
      <div className="absolute right-0 top-0 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-amber-300/40 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] animate-float rounded-full bg-teal-300/30 blur-3xl" />
      <div className="absolute -bottom-20 right-10 h-80 w-80 animate-float-slow rounded-full bg-sky-300/30 blur-3xl" />
    </div>
  );
}
