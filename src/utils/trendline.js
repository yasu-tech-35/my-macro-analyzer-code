/**
 * 局所的な高値・安値 (Swing High/Low) を検出し、トレンドラインを生成・ブレイク判定します。
 * @param {Array} candles - OHLCV配列 [{ time, open, high, low, close }, ...]
 * @returns {Array} 検出されたトレンドライン情報
 */
export function detectTrendlines(candles) {
  if (!candles || candles.length < 20) return [];

  const windowSize = 3; // 前後3本を見て高値/安値を決定
  const swingHighs = [];
  const swingLows = [];

  // 1. スイングハイ・スイングローの抽出
  for (let i = windowSize; i < candles.length - windowSize; i++) {
    const currentHigh = candles[i].high;
    const currentLow = candles[i].low;

    let isHigh = true;
    let isLow = true;

    for (let j = -windowSize; j <= windowSize; j++) {
      if (j === 0) continue;
      if (candles[i + j].high >= currentHigh) isHigh = false;
      if (candles[i + j].low <= currentLow) isLow = false;
    }

    if (isHigh) swingHighs.push({ index: i, date: candles[i].time, price: currentHigh });
    if (isLow) swingLows.push({ index: i, date: candles[i].time, price: currentLow });
  }

  const resultLines = [];

  // 2. 上値抵抗線 (Upper Resistance) の探索
  if (swingHighs.length >= 2) {
    const p1 = swingHighs[swingHighs.length - 2];
    const p2 = swingHighs[swingHighs.length - 1];
    
    // 2点間の傾き (slope) と 切片 (intercept)
    const slope = (p2.price - p1.price) / (p2.index - p1.index);
    const intercept = p1.price - slope * p1.index;

    // 最新足での理論価格
    const latestIndex = candles.length - 1;
    const latestCandle = candles[latestIndex];
    const linePriceAtLatest = slope * latestIndex + intercept;

    // ブレイクアウト判定（最新の終値がラインを明確に超えたか）
    const isBroken = latestCandle.close > linePriceAtLatest;

    resultLines.push({
      id: "TL-UPPER",
      type: "UPPER",
      p1,
      p2,
      slope,
      intercept,
      linePriceAtLatest: Number(linePriceAtLatest.toFixed(3)),
      isBroken,
      breakDirection: isBroken ? "ABOVE" : "NONE"
    });
  }

  return resultLines;
}