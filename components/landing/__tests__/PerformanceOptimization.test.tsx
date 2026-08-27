import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import FallbackImage from '@/components/common/FallbackImage';
import nextConfig from '@/next.config.js';

describe('Performance Optimization Configuration', () => {
  it('enables Gzip / Deflate compression in next.config.js', () => {
    expect(nextConfig.compress).toBe(true);
  });

  it('configures modern AVIF and WebP image formats', () => {
    expect(nextConfig.images?.formats).toContain('image/avif');
    expect(nextConfig.images?.formats).toContain('image/webp');
    expect(nextConfig.images?.minimumCacheTTL).toBe(60);
  });

  it('configures package import optimizations for heavy icons and animation packages', () => {
    const packages = nextConfig.experimental?.optimizePackageImports;
    expect(packages).toContain('lucide-react');
    expect(packages).toContain('framer-motion');
    expect(packages).toContain('@reduxjs/toolkit');
  });

  it('renders FallbackImage with shimmer skeleton container to eliminate CLS', () => {
    const { container } = render(
      <FallbackImage
        src="/test-img.jpg"
        alt="Test image"
        width={300}
        height={200}
        className="test-cls-class"
      />
    );

    const wrapper = container.querySelector('.test-cls-class');
    expect(wrapper).toBeInTheDocument();
    const shimmer = container.querySelector('.animate-pulse');
    expect(shimmer).toBeInTheDocument();
  });
});
