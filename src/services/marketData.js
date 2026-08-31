const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

/**
 * FX日足データを取得します (例: USD/JPY)
 * @param {string} fromSymbol - 変換元 (例: "USD")
 * @param {string} toSymbol - 変換先 (例: "JPY")
 * @returns {Promise<Array>} OHLCV配列
 */
export async function fetchFXDaily(fromSymbol = "USD", toSymbol = "JPY") {
  try {
    const url = `${BASE_URL}?function=FX_DAILY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const timeSeries = data["Time Series FX (Daily)"];
    if (!timeSeries) throw new Error(`FXデータ取得失敗: ${JSON.stringify(data)}`);

    // APIのレスポンスをチャート用フォーマット [{ time: 'YYYY-MM-DD', open, high, low, close }, ...] に変換
    const candles = Object.keys(timeSeries).map((dateStr) => ({
      time: dateStr,
      open: parseFloat(timeSeries[dateStr]["1. open"]),
      high: parseFloat(timeSeries[dateStr]["2. high"]),
      low: parseFloat(timeSeries[dateStr]["3. low"]),
      close: parseFloat(timeSeries[dateStr]["4. close"]),
    })).reverse(); // 古い順に並び替え

    return candles;
  } catch (error) {
    console.error("fetchFXDaily Error:", error);
    // フォールバック用のダミーデータを返す（API制限時の安全策）
    return getFallbackCandles();
  }
}

/**
 * コモディティ/指標データ (金・原油・米10年金利) を取得します
 * @param {string} functionName - APIファンクション名 ('GOLD', 'WTI', 'TREASURY_YIELD')
 * @returns {Promise<Array>} データ配列 [{ date, value }]
 */
export async function fetchIndicator(functionName) {
  try {
    const url = `${BASE_URL}?function=${functionName}&interval=daily&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) return [];
    return data.data.slice(0, 30); // 直近30日分を取得
  } catch (error) {
    console.error(`fetchIndicator (${functionName}) Error:`, error);
    return [];
  }
}

// API制限時・開発用のフォールバックデータ生成関数
function getFallbackCandles() {
  const today = new Date();
  const candles = [];
  let basePrice = 145.00;

  for (let i = 60; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const timeStr = d.toISOString().split("T")[0];

    const change = (Math.random() - 0.48) * 1.2;
    const open = basePrice;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 0.5;
    const low = Math.min(open, close) - Math.random() * 0.5;
    basePrice = close;

    candles.push({ time: timeStr, open, high, low, close });
  }
  return candles;
}