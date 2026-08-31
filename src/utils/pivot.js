/**
 * 前日の日足データ (High, Low, Close) から標準ピボット (Floor Pivot) を計算します。
 * @param {Object} lastCandle - 前日のローソク足 { high, low, close }
 * @returns {Object} ピボットポイント (P, R1~R3, S1~S3)
 */
export function calculatePivotPoints(lastCandle) {
  if (!lastCandle) return null;

  const { high: H, low: L, close: C } = lastCandle;

  // 中心となるピボットポイント (P)
  const P = (H + L + C) / 3;

  // レジスタンスライン（抵抗線）
  const R1 = 2 * P - L;
  const R2 = P + (H - L);
  const R3 = H + 2 * (P - L);

  // サポートライン（支持線）
  const S1 = 2 * P - H;
  const S2 = P - (H - L);
  const S3 = L - 2 * (H - P);

  return {
    pivot: Number(P.toFixed(3)),
    r1: Number(R1.toFixed(3)),
    r2: Number(R2.toFixed(3)),
    r3: Number(R3.toFixed(3)),
    s1: Number(S1.toFixed(3)),
    s2: Number(S2.toFixed(3)),
    s3: Number(S3.toFixed(3)),
  };
}