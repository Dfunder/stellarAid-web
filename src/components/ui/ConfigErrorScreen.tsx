/**
 * Boot-time fallback shown when the app refuses to start because the runtime
 * environment configuration is invalid. Presentational only.
 */
export default function ConfigErrorScreen({
  message,
  invalidKeys = [],
}: {
  message: string
  /** Names of the variables that caused the rejection (#864). */
  invalidKeys?: string[]
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <h1 className="text-h2">Invalid environment configuration</h1>

      {invalidKeys.length > 0 && (
        <div className="mt-6 rounded-control border border-danger bg-danger/10 p-4">
          <p className="text-caption font-semibold text-danger">
            Check these {invalidKeys.length === 1 ? 'variable' : 'variables'}:
          </p>
          <ul className="mt-2 list-inside list-disc font-mono text-caption text-danger">
            {invalidKeys.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </div>
      )}

      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-control border border-line bg-surface-muted p-4 text-body">
        {message}
      </pre>
    </main>
  )
}
