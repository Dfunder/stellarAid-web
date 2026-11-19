let cached: Promise<unknown> | undefined;

// Loads the wallets kit lazily from the connect handler: `loader` should be
// `() => import("<kit package>")` so the kit is never in the initial bundle.
// The promise is cached so later connects reuse the download; a failed import
// is not cached and surfaces as a readable error.
export function loadWalletKit<T>(loader: () => Promise<T>): Promise<T> {
  cached ??= loader().catch(() => {
    cached = undefined;
    throw new Error("Could not load the wallet library. Check your connection and try again.");
  });
  return cached as Promise<T>;
}
