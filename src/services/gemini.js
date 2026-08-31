import { GoogleGenAI, Type } from "@google/genai";

// Gemini API の初期化 (VITE_GEMINI_API_KEY を使用)
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

// AIのレスポンスフォーマット（JSON Schema）の定義
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    impactScore: { type: Type.INTEGER, description: "1~10のマクロインパクト度" },
    summary: { type: Type.STRING, description: "市場概況の要約" },
    scenarios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: "SHORT, MEDIUM, または LONG" },
          baseCase: {
            type: Type.OBJECT,
            properties: {
              targetPriceRange: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "[下限価格, 上限価格]"
              },
              probability: { type: Type.NUMBER, description: "0.0~1.0の確率" },
              rationale: { type: Type.STRING, description: "シナリオ根拠" }
            },
            required: ["targetPriceRange", "probability", "rationale"]
          },
          bullScenario: {
            type: Type.OBJECT,
            properties: {
              targetPrice: { type: Type.NUMBER },
              trigger: { type: Type.STRING }
            },
            required: ["targetPrice", "trigger"]
          },
          bearScenario: {
            type: Type.OBJECT,
            properties: {
              targetPrice: { type: Type.NUMBER },
              trigger: { type: Type.STRING }
            },
            required: ["targetPrice", "trigger"]
          }
        },
        required: ["term", "baseCase", "bullScenario", "bearScenario"]
      }
    }
  },
  required: ["impactScore", "summary", "scenarios"]
};

/**
 * 市場データとニュースをGemini APIに投入し、構造化AI分析レポートを生成します
 * @param {Object} marketContext - ピボット、トレンドライン、指標等を含むコンテキストオブジェクト
 * @returns {Promise<Object>} JSON解析済みのAIレポート
 */
export async function generateMacroReport(marketContext) {
  const systemInstruction = `
あなたは世界トップクラスのマクロアナリストおよびFXストラテジストです。
提供されたテクニカル分析データ（ピボットポイント、トレンドライン）およびマクロ指標データ（金利、原油、金）を客観的に評価し、将来の価格予測シナリオを作成してください。
指示されたJSONスキーマに従って厳密に出力してください。
`;

  const prompt = `
以下の市場データを分析し、短期（1日〜1週間）・中期（1ヶ月〜3ヶ月）・長期（3ヶ月〜1年）の予測シナリオを構築してください。

【現在の市場状況】
- 対象ペア: ${marketContext.symbol} (現在値: ${marketContext.currentPrice})
- ピボットライン: P=${marketContext.pivots.pivot}, R1=${marketContext.pivots.r1}, S1=${marketContext.pivots.s1}
- トレンドライン検出: ${JSON.stringify(marketContext.trendlines)}
- 米10年金利: ${marketContext.us10y}%
- 原油(WTI): $${marketContext.crudeOil}
- 金(XAU/USD): $${marketContext.gold}

【最新ニュース・ファンダメンタルズ】
${marketContext.newsText || "特記事項なし（金利動向とテクニカル指標を重視して分析してください）"}
`;

  try {
    // SDK 呼び出し (gemini-2.5-flash-lite を指定)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2 // 予測のブレを抑えるため低めに設定
      }
    });

    if (!response.text) {
      throw new Error("Gemini APIからのレスポンスが空でした。");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Analysis Error:", error);
    throw error;
  }
}