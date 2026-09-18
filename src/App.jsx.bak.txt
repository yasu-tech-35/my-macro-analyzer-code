import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// サービス & ユーティリティのインポート
import { fetchFXDaily } from "./services/marketData";
import { generateMacroReport } from "./services/gemini";
import { calculatePivotPoints } from "./utils/pivot";
import { detectTrendlines } from "./utils/trendline";
import { calculateCorrelation } from "./utils/correlation";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// UIコンポーネントのインポート
import Header from "./components/Header";
import MainChart from "./components/MainChart";
import CorrelationPanel from "./components/CorrelationPanel";
import AIScenarioPanel from "./components/AIScenarioPanel";

export default function App() {
  // アプリケーションの状態管理
  const [selectedSymbol, setSelectedSymbol] = useState("USDJPY");
  const [candles, setCandles] = useState([]);
  const [pivots, setPivots] = useState(null);
  const [trendlines, setTrendlines] = useState([]);
  const [correlationData, setCorrelationData] = useState(null);
  const [aiReport, setAiReport] = useState(null);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // マクロ指標の状態（ダミーおよびAPI連携用）
  const [macroIndicators] = useState({
    us10y: 3.85,
    crudeOil: 75.2,
    gold: 2510.0,
  });

  // 1. 初回および通貨ペア変更時に市場データを取得・計算
  useEffect(() => {
    loadMarketData();
  }, [selectedSymbol]);

  const loadMarketData = async () => {
    setIsLoadingData(true);
    try {
      // 選択中のシンボルに応じて FX 日足データを取得
      const fromCurr = selectedSymbol.substring(0, 3);
      const toCurr = selectedSymbol.substring(3, 6);
      const dailyData = await fetchFXDaily(fromCurr, toCurr);
      setCandles(dailyData);

      if (dailyData.length >= 2) {
        // 直前足をもとにピボットを計算
        const lastCandle = dailyData[dailyData.length - 2];
        const p = calculatePivotPoints(lastCandle);
        setPivots(p);

        // トレンドラインの検出とブレイク判定
        const lines = detectTrendlines(dailyData);
        setTrendlines(lines);

        // 相関計算 (擬似マクロデータ系列との相関係数を算出)
        const closePrices = dailyData.map((c) => c.close);
        const dummyDxyPrices = closePrices.map((p) => p * 0.7 + (Math.random() - 0.5));
        
        setCorrelationData({
          dxy: calculateCorrelation(closePrices, dummyDxyPrices),
          us10y: 0.65,
          gold: -0.42,
          crudeOil: 0.28,
        });
      }
    } catch (error) {
      console.error("データ読み込みエラー:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // 2. Gemini AI によるシナリオ解析の実行と Firestore 保存
  const handleRunAIAnalysis = async () => {
    if (candles.length === 0 || !pivots) return;

    setIsAnalyzing(true);
    try {
      const currentPrice = candles[candles.length - 1].close;

      const context = {
        symbol: selectedSymbol,
        currentPrice,
        pivots,
        trendlines,
        us10y: macroIndicators.us10y,
        crudeOil: macroIndicators.crudeOil,
        gold: macroIndicators.gold,
        newsText: "FRBによる利下げ観測が強まる一方、日銀の追加利上げ姿勢により日米金利差の縮小が意識されている。",
      };

      // Gemini API 呼び出し
      const report = await generateMacroReport(context);
      setAiReport(report);

      // 分析結果を Firestore に保存
      await addDoc(collection(db, "ai_reports"), {
        targetSymbol: selectedSymbol,
        report,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      alert("AI分析中にエラーが発生しました。APIキーまたはネットワークを確認してください。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-dark text-light min-vh-100 pb-4">
      {/* 1. ヘッダー & ナビゲーション */}
      <Header
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
        onRefreshData={loadMarketData}
        onRunAI={handleRunAIAnalysis}
        isLoadingData={isLoadingData}
        isAnalyzing={isAnalyzing}
      />

      <div className="container-fluid px-3">
        {/* 2. メインコンテンツエリア */}
        <div className="row g-3">
          {/* 左側 (70%幅): メインチャート */}
          <div className="col-lg-8">
            <MainChart candles={candles} pivots={pivots} trendlines={trendlines} />
          </div>

          {/* 右側 (30%幅): マクロ相関・指標パネル */}
          <div className="col-lg-4">
            <CorrelationPanel
              correlationData={correlationData}
              macroIndicators={macroIndicators}
            />
          </div>

          {/* 下部 (全幅): Gemini AI シナリオ予測ボード */}
          <div className="col-12">
            <AIScenarioPanel report={aiReport} isLoading={isAnalyzing} />
          </div>
        </div>
      </div>
    </div>
  );
}