export function SkeletonPost() {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-4 animate-pulse">
      <div className="p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-800" />
        <div className="h-4 bg-zinc-800 rounded w-24" />
      </div>
      <div className="aspect-square max-h-96 bg-zinc-800" />
      <div className="p-3 space-y-2">
        <div className="flex gap-4">
          <div className="h-6 w-6 bg-zinc-800 rounded" />
          <div className="h-6 w-6 bg-zinc-800 rounded" />
        </div>
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
      </div>
    </div>
  )
}

export function SkeletonPostList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPost key={i} />
      ))}
    </>
  )
}
