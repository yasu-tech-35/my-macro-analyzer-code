// src/services/marketData.js

// Viteの環境変数から Alpha Vantage API キーを取得
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

/**
 * 開発時の API 消費を防ぐための切り替えフラグ
 * true にすると API 通信を行わず、常にダミーデータを返します。
 * 本番データを取得したい場合は false に設定してください。
 */
const USE_DUMMY_ALWAYS = false;

/**
 * 通貨ペアの日足データを取得する非同期関数（1時間キャッシュ機能付き）
 * @param {string} fromSymbol - 変換元通貨（例: "USD"）
 * @param {string} toSymbol - 変換先通貨（例: "JPY"）
 * @returns {Promise<Array>} ローソク足データ配列 [{ time, open, high, low, close }]
 */
export const fetchFXDaily = async (fromSymbol = "USD", toSymbol = "JPY") => {
  // 常にダミーデータを使用するフラグが有効な場合
  if (USE_DUMMY_ALWAYS) {
    console.log(`[Dev Mode] API消費を抑えるためダミーデータを使用します (${fromSymbol}/${toSymbol})`);
    return generateDummyMarketData();
  }

  // APIキーが未設定の場合のログ警告
  if (!API_KEY || API_KEY === "YOUR_ALPHA_VANTAGE_API_KEY") {
    console.warn("Alpha Vantage APIキーが設定されていません。.env ファイルを確認してください。");
    return generateDummyMarketData();
  }

  // --- 1. ローカルストレージ（キャッシュ）の確認 ---
  const cacheKey = `fx_daily_${fromSymbol}_${toSymbol}`;
  const cacheTimeKey = `fx_daily_time_${fromSymbol}_${toSymbol}`;
  const cachedData = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(cacheTimeKey);

  // キャッシュの有効期限：1時間 (3600,000 ミリ秒)
  const ONE_HOUR = 60 * 60 * 1000;

  if (cachedData && cachedTime && Date.now() - Number(cachedTime) < ONE_HOUR) {
    console.log(`[Cache Hit] ${fromSymbol}/${toSymbol} は1時間以内のキャッシュデータを使用します（API通信スキップ）。`);
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      console.error("キャッシュデータのパースに失敗しました。再取得します。", e);
    }
  }

  // --- 2. キャッシュがない（または古い）場合のみ API 通信を実行 ---
  const url = `${BASE_URL}?function=FX_DAILY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${API_KEY}`;

  try {
    console.log(`[API Request] Alpha Vantage へ通信中: ${fromSymbol}/${toSymbol}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ネットワークエラーが発生しました (ステータス: ${response.status})`);
    }

    const data = await response.json();
    const timeSeries = data["Time Series FX (Daily)"];

    // データが正しく取得できなかった場合（API回数制限エラーやキーエラー等）
    if (!timeSeries) {
      console.warn("Alpha Vantage から有効なデータが返されませんでした（制限到達等の可能性）。ダミーデータを使用します。", data);
      return generateDummyMarketData();
    }

    // JSONオブジェクトのキー（日付文字列）を取得し、昇順（古い日付順）にソート
    const dates = Object.keys(timeSeries).sort();

    // チャート描画ライブラリで扱いやすい配列形式に整形
    const formattedData = dates.map((date) => {
      const dayData = timeSeries[date];
      return {
        time: date,
        open: parseFloat(dayData["1. open"]),
        high: parseFloat(dayData["2. high"]),
        low: parseFloat(dayData["3. low"]),
        close: parseFloat(dayData["4. close"]),
      };
    });

    // --- 3. 取得成功データをローカルストレージに保存 ---
    try {
      localStorage.setItem(cacheKey, JSON.stringify(formattedData));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
      console.log(`[Cache Saved] ${fromSymbol}/${toSymbol} のデータをローカルストレージに保存しました。`);
    } catch (e) {
      console.warn("ローカルストレージへの保存に失敗しました。", e);
    }

    return formattedData;
  } catch (error) {
    console.error("市場データ取得中にエラーが発生しました:", error);
    // エラー発生時もアプリがクラッシュしないようダミーデータを返却
    return generateDummyMarketData();
  }
};

/**
 * API制限時やエラー時・開発時にアプリを動作させるためのダミーローソク足データ生成関数
 */
const generateDummyMarketData = () => {
  const dummyData = [];
  let basePrice = 145.0;
  const today = new Date();

  // 過去60日分のローソク足データを擬似生成
  for (let i = 60; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const randomChange = (Math.random() - 0.48) * 1.2;
    const open = basePrice;
    const close = parseFloat((open + randomChange).toFixed(3));
    const high = parseFloat((Math.max(open, close) + Math.random() * 0.8).toFixed(3));
    const low = parseFloat((Math.min(open, close) - Math.random() * 0.8).toFixed(3));

    dummyData.push({
      time: dateStr,
      open,
      high,
      low,
      close,
    });

    basePrice = close;
  }

  return dummyData;
};