// Live status of the public widget ("agent"). The widget only answers while
// the owner is on an active plan or trial, so this mirrors entitlement.active.
export function AgentStatus({ active }: { active: boolean }) {
  if (active) {
    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-sm font-medium text-slate-600">
          Chatbot is online
        </span>
      </div>
    );
  }

  return (
    <div className="group relative flex cursor-default items-center gap-2 whitespace-nowrap">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
      <span className="text-sm font-medium text-slate-600">
        Chatbot is offline
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-56 whitespace-normal rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-normal leading-snug text-white opacity-0 invisible shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100"
      >
        Please select a plan to activate your chatbot
      </span>
    </div>
  );
}
