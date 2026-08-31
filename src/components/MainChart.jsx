import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function MainChart({ candles, pivots, trendlines }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !candles || candles.length === 0) return;

    // チャート全体の初期化
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#1e1e1e" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      timeScale: { borderColor: "#485c7b" },
    });

    // 1. ローソク足シリーズの追加
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeries.setData(candles);

    // 2. ピボットライン (水平線) の描画
    if (pivots) {
      // メインピボット (P) - 黄色
      const pivotLine = chart.addLineSeries({ color: "#ffee58", lineWidth: 1, lineStyle: 2 });
      pivotLine.setData(candles.map(c => ({ time: c.time, value: pivots.pivot })));

      // R1 (抵抗線1) - 赤色
      const r1Line = chart.addLineSeries({ color: "#ef5350", lineWidth: 1, lineStyle: 3 });
      r1Line.setData(candles.map(c => ({ time: c.time, value: pivots.r1 })));

      // S1 (支持線1) - 緑色
      const s1Line = chart.addLineSeries({ color: "#26a69a", lineWidth: 1, lineStyle: 3 });
      s1Line.setData(candles.map(c => ({ time: c.time, value: pivots.s1 })));
    }

    // 3. 自動検出されたトレンドラインの描画
    if (trendlines && trendlines.length > 0) {
      trendlines.forEach((tl) => {
        const lineSeries = chart.addLineSeries({
          color: tl.type === "UPPER" ? "#ff9800" : "#2196f3",
          lineWidth: 2,
        });

        // 始点と終点の座標を計算してラインを引く
        const lineData = candles.map((c, idx) => ({
          time: c.time,
          value: tl.slope * idx + tl.intercept,
        }));
        lineSeries.setData(lineData);
      });
    }

    // ウィンドウサイズ変更時の自動フィット
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candles, pivots, trendlines]);

  return (
    <div className="card bg-dark text-white mb-3">
      <div className="card-header border-secondary d-flex justify-content-between align-items-center">
        <h5 className="m-0">ローソク足チャート & テクニカル指標</h5>
        <span className="badge bg-secondary">日足 (Daily)</span>
      </div>
      <div className="card-body p-1">
        <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
      </div>
    </div>
  );
}