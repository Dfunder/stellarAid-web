import { CacheManager } from './cacheManager';

export const apiCache = new CacheManager({
  version: 'v1',
  maxEntries: 100,
  ttlByNamespace: {
    default: 60_000,
    projects: 60_000,
    project: 180_000,
    featuredProjects: 300_000,
    bookmarkedProjects: 30_000,
    updates: 60_000,
  },
});

export function getApiCacheMetrics() {
  return apiCache.getMetrics();
}
