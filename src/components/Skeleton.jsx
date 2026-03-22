export function Skeleton({ className = '' }) {
  return <div className={`bg-white/[0.06] animate-pulse ${className}`} />
}

export function ProductCardSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="aspect-[2/3] bg-white/[0.06] animate-pulse" />
          <div className="space-y-2 pt-1">
            <div className="h-2 bg-white/[0.04] animate-pulse w-1/3" />
            <div className="h-2.5 bg-white/[0.06] animate-pulse w-2/3" />
            <div className="h-2 bg-white/[0.04] animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black px-8 md:px-12 pt-16 pb-24">
      {/* Back link placeholder */}
      <div className="h-3 w-24 bg-white/[0.04] animate-pulse mb-10" />

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image column */}
        <div className="space-y-3">
          <div className="aspect-[3/4] bg-white/[0.06] animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        </div>

        {/* Detail column */}
        <div className="space-y-5 pt-2">
          <div className="h-2.5 bg-white/[0.04] animate-pulse w-1/4" />
          <div className="h-9 bg-white/[0.06] animate-pulse w-3/4" />
          <div className="h-6 bg-white/[0.05] animate-pulse w-1/5" />
          <div className="space-y-2 pt-2">
            <div className="h-2 bg-white/[0.04] animate-pulse" />
            <div className="h-2 bg-white/[0.04] animate-pulse" />
            <div className="h-2 bg-white/[0.04] animate-pulse w-4/5" />
          </div>
          {/* Color swatches placeholder */}
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse" />
            ))}
          </div>
          {/* Size grid placeholder */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-12 h-10 bg-white/[0.04] animate-pulse" />
            ))}
          </div>
          {/* CTA buttons */}
          <div className="space-y-3 pt-2">
            <div className="h-13 bg-white/[0.06] animate-pulse" style={{ height: '52px' }} />
            <div className="h-13 bg-white/[0.04] animate-pulse" style={{ height: '52px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
