/**
 * 2つの数値配列間のピアソン相関係数を算出します。
 * @param {Array<number>} x - 配列1 (例: ドルインデックスの終値配列)
 * @param {Array<number>} y - 配列2 (例: EUR/USDの終値配列)
 * @returns {number} 相関係数 (-1.0 ～ 1.0)
 */
export function calculateCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;

  let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
    sumXY += x[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(2));
}