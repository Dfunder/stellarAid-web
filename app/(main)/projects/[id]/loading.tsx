export default function ProjectDetailsLoading() {
  return (
    <div className="min-h-screen bg-[#f0f4fa] pt-24">
      <div className="border-b border-neutral-200 bg-white">
        <div className="container mx-auto max-w-[1280px] px-4 py-5">
          <div className="h-5 w-72 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>

      <main className="container mx-auto max-w-[1280px] px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-8">
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-5 space-y-4">
                <div className="h-6 w-40 animate-pulse rounded-full bg-neutral-100" />
                <div className="h-12 w-3/4 animate-pulse rounded bg-neutral-100" />
                <div className="h-5 w-full animate-pulse rounded bg-neutral-100" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-100" />
              </div>
              <div className="aspect-[16/9] animate-pulse rounded-xl bg-neutral-100" />
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
              <div className="mt-5 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="h-5 w-36 animate-pulse rounded bg-neutral-100" />
              <div className="mt-4 h-10 w-48 animate-pulse rounded bg-neutral-100" />
              <div className="mt-5 h-4 w-full animate-pulse rounded-full bg-neutral-100" />
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="h-24 animate-pulse rounded-lg bg-neutral-100" />
                <div className="h-24 animate-pulse rounded-lg bg-neutral-100" />
                <div className="h-24 animate-pulse rounded-lg bg-neutral-100" />
              </div>
            </section>
            <div className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-white" />
          </aside>
        </div>
      </main>
    </div>
  );
}

