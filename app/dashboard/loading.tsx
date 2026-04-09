export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#070d1a]">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-white/10 flex-col py-8 px-4">
        <div className="h-6 w-32 bg-white/10 rounded-lg mb-10 animate-pulse" />
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="h-9 w-48 bg-white/10 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="h-5 w-5 bg-white/10 rounded animate-pulse mx-auto mb-2" />
              <div className="h-7 w-16 bg-white/10 rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-12 bg-white/5 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>

        {/* Active guide card skeleton */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="h-3 w-20 bg-emerald-500/20 rounded animate-pulse mb-2" />
              <div className="h-6 w-48 bg-white/10 rounded animate-pulse mb-1" />
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="h-2 bg-white/10 rounded-full mb-5 animate-pulse" />
          <div className="h-10 w-40 bg-emerald-500/20 rounded-xl animate-pulse" />
        </div>

        {/* Activity skeleton */}
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
              <div className="flex-1 h-4 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>

      {/* Mobile bottom tab bar skeleton */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#070d1a] border-t border-white/10 flex">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 py-3">
            <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
            <div className="w-10 h-2 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
