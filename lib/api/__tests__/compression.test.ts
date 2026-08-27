import { describe, it, expect } from 'vitest';
import api from '@/app/services/api';
import { apiClient as utilsApiClient } from '@/utils/apiClient';
import libApiClient from '@/lib/api/client';
import { GET as healthHandler } from '@/app/api/health/route';
import { GET as compressionHandler } from '@/app/api/compression/route';
// @ts-ignore
import nextConfig from '@/next.config.js';

describe('API Response Compression Configuration', () => {
  describe('next.config.js compression settings', () => {
    it('should have compress: true explicitly enabled', () => {
      expect(nextConfig.compress).toBe(true);
    });

    it('should include Vary: Accept-Encoding in custom headers for /api routes', async () => {
      expect(typeof nextConfig.headers).toBe('function');
      const headersConfig = (await nextConfig.headers?.()) || [];
      const apiHeaderRule = headersConfig.find(
        (rule: { source: string }) => rule.source === '/api/:path*'
      );

      expect(apiHeaderRule).toBeDefined();
      const varyHeader = apiHeaderRule?.headers?.find(
        (h: { key: string; value: string }) => h.key.toLowerCase() === 'vary'
      );
      expect(varyHeader).toBeDefined();
      expect(varyHeader?.value).toContain('Accept-Encoding');
    });
  });

  describe('Axios Client Compression Headers & Config', () => {
    it('app/services/api should configure compression headers and decompress: true', () => {
      expect(api.defaults.decompress).toBe(true);
      const headers = api.defaults.headers;
      const acceptEncoding =
        (headers as Record<string, unknown>)['Accept-Encoding'] ||
        (headers.common as Record<string, unknown> | undefined)?.['Accept-Encoding'];
      expect(acceptEncoding).toBe('gzip, deflate, br');
      const accept =
        (headers as Record<string, unknown>)['Accept'] ||
        (headers.common as Record<string, unknown> | undefined)?.['Accept'];
      expect(accept).toBe('application/json');
    });

    it('utils/apiClient should configure compression headers and decompress: true', () => {
      expect(utilsApiClient.defaults.decompress).toBe(true);
      const headers = utilsApiClient.defaults.headers;
      const acceptEncoding =
        (headers as Record<string, unknown>)['Accept-Encoding'] ||
        (headers.common as Record<string, unknown> | undefined)?.['Accept-Encoding'];
      expect(acceptEncoding).toBe('gzip, deflate, br');
      const accept =
        (headers as Record<string, unknown>)['Accept'] ||
        (headers.common as Record<string, unknown> | undefined)?.['Accept'];
      expect(accept).toBe('application/json');
    });

    it('lib/api/client should configure compression headers and decompress: true', () => {
      expect(libApiClient.defaults.decompress).toBe(true);
      const headers = libApiClient.defaults.headers;
      const acceptEncoding =
        (headers as Record<string, unknown>)['Accept-Encoding'] ||
        (headers.common as Record<string, unknown> | undefined)?.['Accept-Encoding'];
      expect(acceptEncoding).toBe('gzip, deflate, br');
      const accept =
        (headers as Record<string, unknown>)['Accept'] ||
        (headers.common as Record<string, unknown> | undefined)?.['Accept'];
      expect(accept).toBe('application/json');
    });
  });

  describe('Route Handlers', () => {
    it('/api/health route handler should return status ok with Vary: Accept-Encoding', async () => {
      const response = await healthHandler();
      expect(response.status).toBe(200);
      expect(response.headers.get('vary')).toBe('Accept-Encoding');
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.service).toBe('stellarAid-api');
      expect(data.compression.enabled).toBe(true);
      expect(data.compression.supportedEncodings).toEqual(['gzip', 'deflate', 'br']);
    });

    it('/api/compression route handler should return structured dataset with Vary: Accept-Encoding', async () => {
      const response = await compressionHandler();
      expect(response.status).toBe(200);
      expect(response.headers.get('vary')).toBe('Accept-Encoding');
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.totalCount).toBe(100);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(100);
    });
  });
});
