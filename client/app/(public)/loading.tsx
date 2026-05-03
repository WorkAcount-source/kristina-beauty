export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative min-h-[100svh] flex items-center bg-gradient-rose">
        <div className="container grid lg:grid-cols-2 gap-12 items-center py-20 pt-40">
          <div className="space-y-8">
            <div className="h-6 w-48 bg-rose-200/60 rounded-full animate-pulse" />
            <div className="space-y-3">
              <div className="h-14 w-3/4 bg-rose-200/60 rounded-2xl animate-pulse" />
              <div className="h-14 w-1/2 bg-rose-200/60 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-rose-100/80 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-rose-100/80 rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-14 w-36 bg-rose-300/50 rounded-full animate-pulse" />
              <div className="h-14 w-36 bg-rose-200/50 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-[2.5rem] bg-rose-200/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
