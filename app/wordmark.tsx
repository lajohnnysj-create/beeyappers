export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white">
        {/* honey dot: the single sparing bee nod */}
        <span className="h-2 w-2 rounded-full bg-honey" aria-hidden="true" />
      </span>
      <span className="tracking-tight text-slate-900">Bee Yappers</span>
    </span>
  );
}
