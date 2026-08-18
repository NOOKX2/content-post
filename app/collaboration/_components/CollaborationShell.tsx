export function CollaborationShell() {
  return (
    <div className="flex h-full min-h-0 animate-pulse overflow-hidden bg-stone-50">
      <div className="hidden w-14 shrink-0 border-r border-stone-200 bg-white md:block" />
      <div className="hidden w-[300px] shrink-0 border-r border-stone-200 bg-white md:block" />
      <div className="min-w-0 flex-1 space-y-4 p-4">
        <div className="h-10 w-48 rounded-lg bg-stone-200" />
        <div className="h-32 rounded-2xl bg-stone-200" />
        <div className="h-64 rounded-2xl bg-stone-200" />
      </div>
    </div>
  );
}
