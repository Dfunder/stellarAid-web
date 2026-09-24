/**
 * Boot-time fallback shown when the app refuses to start because the runtime
 * environment configuration is invalid. Presentational only.
 */
export default function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <h1 className="text-h2">Invalid environment configuration</h1>
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-control border border-danger bg-danger/10 p-4 text-body">
        {message}
      </pre>
    </main>
  )
}
