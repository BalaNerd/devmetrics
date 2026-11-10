'use client';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-6 sm:p-8 animate-pulse ${className}`}>
      <div className="flex justify-between mb-5">
        <div className="space-y-2.5">
          <div className="h-3.5 w-28 bg-[#0C1222]/20 rounded-md" />
          <div className="h-2.5 w-36 bg-[#5C6A80]/15 rounded-md" />
        </div>
        <div className="h-7 w-20 bg-[#EEF1FF] rounded-xl border border-[#3D4FE0]/50" />
      </div>
      <div className="space-y-4">
        <div className="h-20 bg-[#F7F8FC] border border-[#5C6A80]/15 rounded-2xl" />
        <div className="h-3 bg-[#5C6A80]/20 rounded-md w-3/4" />
        <div className="h-2.5 bg-[#5C6A80]/10 rounded-md w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-6 sm:p-8 animate-pulse ${className}`}>
      <div className="flex justify-between mb-6">
        <div className="space-y-2.5">
          <div className="h-4 w-32 bg-[#0C1222]/20 rounded-md" />
          <div className="h-2.5 w-48 bg-[#5C6A80]/15 rounded-md" />
        </div>
        <div className="h-8 w-28 bg-[#F7F8FC] border border-[#5C6A80]/20 rounded-xl" />
      </div>
      <div className="flex items-end gap-2.5 h-64 sm:h-72">
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            className="flex-1 bg-[#EEF1FF] border-t border-[#0C1222]/30 rounded-t-xl"
            style={{ height: `${20 + ((i * 13) % 65)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonPills() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="glass-card p-4 h-20 bg-[#FFFFFF] rounded-2xl" />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="glass-card p-6 sm:p-8 animate-pulse">
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F7F8FC] border border-[#5C6A80]/20 shrink-0" />
          <div className="space-y-3">
            <div className="h-6 w-56 bg-[#0C1222]/20 rounded-lg" />
            <div className="h-3.5 w-80 bg-[#5C6A80]/15 rounded-md" />
            <div className="flex gap-3 pt-1">
              <div className="h-3 w-20 bg-[#EEF1FF] rounded-md" />
              <div className="h-3 w-20 bg-[#5C6A80]/20 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-[#EEF1FF] rounded-xl border border-[#3D4FE0]" />
          <div className="h-10 w-24 bg-[#F7F8FC] rounded-xl border border-[#5C6A80]/20" />
        </div>
      </div>
    </div>
  );
}
