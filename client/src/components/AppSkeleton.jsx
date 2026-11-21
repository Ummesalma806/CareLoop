// Shown if the app is still checking the login after the intro finishes
export default function AppSkeleton() {
  return (
    <div className="min-h-screen lg:pl-64">
      <div className="fixed inset-y-0 left-0 hidden w-64 animate-pulse bg-ink/90 lg:block" />
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-8">
        <div className="h-9 w-56 animate-pulse rounded-xl bg-stone-200" />
        <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200" />)}</div>
        {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200" />)}
      </div>
    </div>
  );
}
