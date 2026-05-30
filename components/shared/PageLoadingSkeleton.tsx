import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden">
      <div className="glow-bg top-[-200px] left-[-200px] opacity-10" />
      <div className="glow-bg bottom-[-200px] right-[-200px] opacity-10" />
      <div className="z-10 relative">{children}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-warm-100 animate-fade-in">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-sage-200 bg-white/80 md:flex">
          <div className="flex items-center gap-3 border-b border-sage-200 px-6 py-5">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <Skeleton className="h-7 w-32" />
          </div>
          <nav className="flex-1 space-y-2 px-3 py-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-l-xl" />
            ))}
          </nav>
          <div className="border-t border-sage-200 p-4">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </aside>
        <main className="flex-1 pb-24 md:pb-0">
          <header className="border-b border-sage-200 bg-warm-100/90 px-4 py-5 sm:px-6 lg:px-8">
            <Skeleton className="mb-2 h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </header>
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <header className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-8">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 rounded-2xl border border-warm-200 bg-warm-100/95 p-3">
        <Skeleton className="md:col-span-2 h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
      <div className="mb-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-12 w-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

type PageLoadingVariant = "dashboard" | "listing" | "detail";

export function PageLoadingSkeleton({ variant }: { variant: PageLoadingVariant }) {
  const content =
    variant === "dashboard" ? (
      <DashboardSkeleton />
    ) : variant === "listing" ? (
      <ListingSkeleton />
    ) : (
      <DetailSkeleton />
    );

  if (variant === "dashboard") {
    return content;
  }

  return <PageLoadingShell>{content}</PageLoadingShell>;
}
