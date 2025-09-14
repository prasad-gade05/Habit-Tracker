// Utility functions for correlation calculations

/**
 * Calculate Pearson correlation coefficient between two arrays
 * @param arr1 First array of numbers
 * @param arr2 Second array of numbers
 * @returns Correlation coefficient between -1 and 1
 */
export const calculateCorrelation = (
  arr1: number[],
  arr2: number[]
): number => {
  const n = arr1.length;
  if (n !== arr2.length || n === 0) return 0;

  const sum1 = arr1.reduce((a, b) => a + b, 0);
  const sum2 = arr2.reduce((a, b) => a + b, 0);
  const sum1Sq = arr1.reduce((a, b) => a + b * b, 0);
  const sum2Sq = arr2.reduce((a, b) => a + b * b, 0);
  const sumProd = arr1.reduce((a, b, i) => a + b * arr2[i], 0);

  const numerator = sumProd - (sum1 * sum2) / n;
  const denominator = Math.sqrt(
    (sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n)
  );

  if (denominator === 0) return 0;

  return Math.min(Math.max(numerator / denominator, -1), 1);
};

/**
 * Calculate correlation matrix for multiple arrays
 * @param data Object with habit IDs as keys and completion arrays as values
 * @returns Object with habit pair IDs as keys and correlation values
 */
export const calculateCorrelationMatrix = (
  data: Record<string, number[]>
): Record<string, number> => {
  const correlations: Record<string, number> = {};
  const habitIds = Object.keys(data);

  for (let i = 0; i < habitIds.length; i++) {
    for (let j = i + 1; j < habitIds.length; j++) {
      const habit1Id = habitIds[i];
      const habit2Id = habitIds[j];

      const correlation = calculateCorrelation(data[habit1Id], data[habit2Id]);
      const pairId = `${habit1Id}-${habit2Id}`;

      correlations[pairId] = correlation;
    }
  }

  return correlations;
};
