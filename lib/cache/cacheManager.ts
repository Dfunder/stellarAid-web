export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  invalidations: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  touchedAt: number;
}

export interface CacheManagerOptions {
  maxEntries: number;
  version: string;
  ttlByNamespace: Record<string, number>;
}

function buildKey(version: string, namespace: string, key: string): string {
  return `${version}:${namespace}:${key}`;
}

export class CacheManager {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    invalidations: 0,
  };

  constructor(private readonly options: CacheManagerOptions) {}

  get<T>(namespace: string, key: string): T | null {
    const cacheKey = buildKey(this.options.version, namespace, key);
    const entry = this.store.get(cacheKey);

    if (!entry) {
      this.metrics.misses += 1;
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(cacheKey);
      this.metrics.invalidations += 1;
      this.metrics.misses += 1;
      return null;
    }

    entry.touchedAt = Date.now();
    this.metrics.hits += 1;
    return entry.value as T;
  }

  set<T>(namespace: string, key: string, value: T): T {
    const ttl = this.options.ttlByNamespace[namespace] ?? this.options.ttlByNamespace.default ?? 60_000;
    const cacheKey = buildKey(this.options.version, namespace, key);

    this.store.set(cacheKey, {
      value,
      expiresAt: Date.now() + ttl,
      touchedAt: Date.now(),
    });
    this.pruneNamespace(namespace);
    return value;
  }

  async getOrSet<T>(namespace: string, key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(namespace, key);
    if (cached !== null) {
      return cached;
    }

    return this.set(namespace, key, await loader());
  }

  invalidate(namespace: string, key: string): void {
    const cacheKey = buildKey(this.options.version, namespace, key);
    if (this.store.delete(cacheKey)) {
      this.metrics.invalidations += 1;
    }
  }

  invalidateNamespace(namespace: string): void {
    const prefix = buildKey(this.options.version, namespace, '');

    for (const key of Array.from(this.store.keys())) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        this.metrics.invalidations += 1;
      }
    }
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  private pruneNamespace(namespace: string): void {
    const prefix = buildKey(this.options.version, namespace, '');
    const entries = Array.from(this.store.entries())
      .filter(([key]) => key.startsWith(prefix))
      .sort(([, left], [, right]) => left.touchedAt - right.touchedAt);

    while (entries.length > this.options.maxEntries) {
      const [oldestKey] = entries.shift()!;
      this.store.delete(oldestKey);
      this.metrics.evictions += 1;
    }
  }
}
