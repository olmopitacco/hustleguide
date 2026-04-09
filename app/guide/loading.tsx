export default function GuideLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar skeleton — desktop only */}
      <aside className="hidden md:flex w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-gray-800">
          <div className="h-3 w-20 bg-white/10 rounded animate-pulse mb-3" />
          <div className="h-4 w-32 bg-emerald-500/20 rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-white/5 rounded animate-pulse mb-4" />
          <div className="h-1.5 bg-white/10 rounded-full animate-pulse mb-3" />
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-white/5 rounded-lg animate-pulse" />
            <div className="flex-1 h-10 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="p-3 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 bg-white/5 rounded-xl animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 bg-gray-950/90 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-28 bg-emerald-500/20 rounded-xl animate-pulse" />
        </div>

        {/* Mobile week bar */}
        <div className="md:hidden flex gap-2 px-4 py-3 overflow-x-auto border-b border-gray-800">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-14 bg-white/10 rounded-lg animate-pulse shrink-0" />
          ))}
        </div>

        <div className="flex-1 px-4 md:px-8 py-6 max-w-3xl mx-auto w-full space-y-6">
          {/* Week header */}
          <div>
            <div className="h-3 w-16 bg-emerald-500/20 rounded animate-pulse mb-2" />
            <div className="h-8 w-64 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
          </div>

          {/* Progress bar */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-12 bg-emerald-500/20 rounded animate-pulse" />
            </div>
            <div className="h-2 bg-gray-700 rounded-full animate-pulse" />
          </div>

          {/* Cards grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-xl p-4 h-24 animate-pulse" />
            <div className="bg-gray-800/50 rounded-xl p-4 h-24 animate-pulse" />
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-white/10 animate-pulse shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Criteria */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                <div className="w-5 h-5 rounded border border-gray-700 animate-pulse" />
                <div className="flex-1 h-3 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
