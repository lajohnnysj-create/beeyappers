export function Wordmark({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Bleviq"
      className={`h-[72px] w-auto ${className}`}
    />
  );
}
