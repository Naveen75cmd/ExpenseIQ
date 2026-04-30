export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-surface border border-border">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="skeleton w-20 h-4" />
          <div className="skeleton w-32 h-8" />
          <div className="skeleton w-16 h-3" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
    </div>
  );
}

export function TransactionItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className="skeleton w-11 h-11 rounded-xl" />
        <div className="space-y-2">
          <div className="skeleton w-24 h-4" />
          <div className="skeleton w-36 h-3" />
        </div>
      </div>
      <div className="skeleton w-20 h-5" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="skeleton w-40 h-5 mb-6" />
      <div className="skeleton w-full h-64 rounded-xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <TransactionItemSkeleton key={i} />
      ))}
    </div>
  );
}
