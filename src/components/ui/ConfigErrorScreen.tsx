/**
 * Boot-time fallback shown when the app refuses to start because the runtime
 * environment configuration is invalid. Presentational only.
 */
export default function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <main
      style={{
        maxWidth: '46rem',
        margin: '4rem auto',
        padding: '0 1.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem' }}>
        Invalid environment configuration
      </h1>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          overflowX: 'auto',
        }}
      >
        {message}
      </pre>
    </main>
  )
}
