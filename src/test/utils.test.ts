import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('utils - cn (className utility)', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle single class name', () => {
    const result = cn('single-class');
    expect(result).toBe('single-class');
  });

  it('should handle conditional classes with undefined', () => {
    const result = cn('base-class', undefined, 'another-class');
    expect(result).toContain('base-class');
    expect(result).toContain('another-class');
  });

  it('should handle conditional classes with false', () => {
    const result = cn('base-class', false && 'conditional-class');
    expect(result).toBe('base-class');
  });

  it('should handle conditional classes with true', () => {
    const result = cn('base-class', true && 'conditional-class');
    expect(result).toContain('base-class');
    expect(result).toContain('conditional-class');
  });

  it('should merge Tailwind conflicting classes correctly', () => {
    const result = cn('p-4', 'p-8');
    // twMerge should keep only the last padding class
    expect(result).toBe('p-8');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2']);
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'active': true,
      'inactive': false,
      'visible': true,
    });
    expect(result).toContain('active');
    expect(result).not.toContain('inactive');
    expect(result).toContain('visible');
  });

  it('should merge complex Tailwind utilities', () => {
    const result = cn('text-red-500', 'text-blue-500');
    // Should keep only the last color
    expect(result).toBe('text-blue-500');
  });

  it('should handle multiple conflicting Tailwind classes', () => {
    const result = cn('bg-red-500 text-white', 'bg-blue-500');
    // Should keep text-white and override bg-red with bg-blue
    expect(result).toContain('text-white');
    expect(result).toContain('bg-blue-500');
    expect(result).not.toContain('bg-red-500');
  });

  it('should handle spacing utilities correctly', () => {
    const result = cn('m-2 p-4', 'm-8');
    // Should override margin but keep padding
    expect(result).toContain('p-4');
    expect(result).toContain('m-8');
    expect(result).not.toContain('m-2');
  });

  it('should work with responsive classes', () => {
    const result = cn('md:text-lg', 'lg:text-xl');
    expect(result).toContain('md:text-lg');
    expect(result).toContain('lg:text-xl');
  });

  it('should work with hover and state variants', () => {
    const result = cn('hover:bg-blue-500', 'hover:text-white');
    expect(result).toContain('hover:bg-blue-500');
    expect(result).toContain('hover:text-white');
  });

  it('should handle null values', () => {
    const result = cn('base-class', null, 'another-class');
    expect(result).toContain('base-class');
    expect(result).toContain('another-class');
  });

  it('should handle mixed types', () => {
    const result = cn(
      'base',
      ['array-class'],
      { 'object-class': true },
      'string-class',
      undefined,
      null
    );
    expect(result).toContain('base');
    expect(result).toContain('array-class');
    expect(result).toContain('object-class');
    expect(result).toContain('string-class');
  });
});
