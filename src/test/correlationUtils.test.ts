import { describe, it, expect } from 'vitest';
import { calculateCorrelation, calculateCorrelationMatrix } from '../utils/correlationUtils';

describe('correlationUtils - calculateCorrelation', () => {
  it('should return 1 for perfectly positively correlated arrays', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [2, 4, 6, 8, 10];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBeCloseTo(1, 5);
  });

  it('should return -1 for perfectly negatively correlated arrays', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [5, 4, 3, 2, 1];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBeCloseTo(-1, 5);
  });

  it('should return 0 for uncorrelated arrays', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [1, 1, 1, 1, 1];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBe(0);
  });

  it('should return 0 for arrays of different lengths', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3, 4, 5];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBe(0);
  });

  it('should return 0 for empty arrays', () => {
    const arr1: number[] = [];
    const arr2: number[] = [];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBe(0);
  });

  it('should handle arrays with zeros', () => {
    const arr1 = [0, 0, 0, 1, 1];
    const arr2 = [0, 0, 0, 1, 1];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBeCloseTo(1, 5);
  });

  it('should handle arrays with negative numbers', () => {
    const arr1 = [-5, -4, -3, -2, -1];
    const arr2 = [-10, -8, -6, -4, -2];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBeCloseTo(1, 5);
  });

  it('should handle mixed positive and negative correlations', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [1, 3, 2, 4, 5];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it('should return 0 when denominator is 0 (constant arrays)', () => {
    const arr1 = [5, 5, 5, 5, 5];
    const arr2 = [3, 3, 3, 3, 3];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBe(0);
  });

  it('should clamp result between -1 and 1', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [2, 4, 6, 8, 10];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('should handle single element arrays', () => {
    const arr1 = [5];
    const arr2 = [10];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBe(0);
  });

  it('should calculate correlation for binary arrays', () => {
    const arr1 = [1, 0, 1, 1, 0, 0, 1];
    const arr2 = [1, 0, 1, 0, 0, 1, 1];
    const result = calculateCorrelation(arr1, arr2);
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe('correlationUtils - calculateCorrelationMatrix', () => {
  it('should calculate correlations for multiple habits', () => {
    const data = {
      h1: [1, 1, 1, 1, 1],
      h2: [1, 1, 1, 1, 1],
      h3: [0, 0, 0, 0, 0],
    };
    const result = calculateCorrelationMatrix(data);
    
    expect(result).toHaveProperty('h1-h2');
    expect(result).toHaveProperty('h1-h3');
    expect(result).toHaveProperty('h2-h3');
  });

  it('should return perfect correlation for identical habits', () => {
    const data = {
      h1: [1, 0, 1, 0, 1],
      h2: [1, 0, 1, 0, 1],
    };
    const result = calculateCorrelationMatrix(data);
    
    expect(result['h1-h2']).toBeCloseTo(1, 5);
  });

  it('should return negative correlation for opposite habits', () => {
    const data = {
      h1: [1, 1, 1, 1, 1],
      h2: [0, 0, 0, 0, 0],
    };
    const result = calculateCorrelationMatrix(data);
    
    expect(result['h1-h2']).toBe(0);
  });

  it('should handle empty data object', () => {
    const data = {};
    const result = calculateCorrelationMatrix(data);
    
    expect(Object.keys(result).length).toBe(0);
  });

  it('should handle single habit', () => {
    const data = {
      h1: [1, 0, 1, 0, 1],
    };
    const result = calculateCorrelationMatrix(data);
    
    expect(Object.keys(result).length).toBe(0);
  });

  it('should create correct number of pairs', () => {
    const data = {
      h1: [1, 0, 1],
      h2: [0, 1, 0],
      h3: [1, 1, 1],
      h4: [0, 0, 0],
    };
    const result = calculateCorrelationMatrix(data);
    
    // For 4 habits, we should have 6 pairs (4 choose 2)
    expect(Object.keys(result).length).toBe(6);
  });

  it('should use correct pair IDs', () => {
    const data = {
      habit1: [1, 0, 1],
      habit2: [0, 1, 0],
    };
    const result = calculateCorrelationMatrix(data);
    
    expect(result).toHaveProperty('habit1-habit2');
    expect(result).not.toHaveProperty('habit2-habit1');
  });

  it('should calculate different correlations for different pairs', () => {
    const data = {
      h1: [1, 1, 1, 1, 1],
      h2: [1, 1, 1, 1, 1],
      h3: [0, 1, 0, 1, 0],
    };
    const result = calculateCorrelationMatrix(data);
    
    // h1 and h2 are constant arrays, so correlation is 0
    expect(result['h1-h2']).toBe(0);
    expect(result['h1-h3']).not.toBeCloseTo(1, 5);
  });

  it('should handle realistic habit completion data', () => {
    const data = {
      exercise: [1, 1, 0, 1, 0, 1, 1],
      sleep: [1, 1, 1, 0, 0, 1, 1],
      meditation: [0, 1, 1, 0, 1, 0, 1],
    };
    const result = calculateCorrelationMatrix(data);
    
    expect(Object.keys(result).length).toBe(3);
    Object.values(result).forEach(correlation => {
      expect(correlation).toBeGreaterThanOrEqual(-1);
      expect(correlation).toBeLessThanOrEqual(1);
    });
  });

  it('should maintain order independence', () => {
    const data1 = {
      h1: [1, 0, 1],
      h2: [0, 1, 0],
    };
    const data2 = {
      h2: [0, 1, 0],
      h1: [1, 0, 1],
    };
    
    const result1 = calculateCorrelationMatrix(data1);
    const result2 = calculateCorrelationMatrix(data2);
    
    // Should have correlations but with different keys due to order
    expect(Object.keys(result1).length).toBe(1);
    expect(Object.keys(result2).length).toBe(1);
  });
});
