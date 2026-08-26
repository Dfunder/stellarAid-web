import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility function', () => {
  it('combines multiple class names into a single string', () => {
    const result = cn('bg-red-500', 'text-white', 'p-4');
    expect(result).toBe('bg-red-500 text-white p-4');
  });

  it('handles conditional falsy values properly', () => {
    const isHidden = false;
    const isVisible = true;
    const result = cn(
      'base-class',
      isHidden && 'hidden',
      isVisible && 'block',
      null,
      undefined,
      0,
      ''
    );
    expect(result).toBe('base-class block');
  });

  it('resolves conflicting Tailwind utility classes using tailwind-merge', () => {
    // twMerge should override the earlier padding and background color with the later one
    const result = cn('p-2 bg-red-500', 'p-4 bg-blue-500');
    expect(result).toBe('p-4 bg-blue-500');
  });

  it('handles array and object inputs from clsx syntax', () => {
    const result = cn(['font-bold', 'text-center'], {
      'opacity-100': true,
      'opacity-0': false,
    });
    expect(result).toBe('font-bold text-center opacity-100');
  });
});
