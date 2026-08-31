import React, { useState } from "react";

export default function AIScenarioPanel({ report, isLoading }) {
  const [activeTab, setActiveTab] = useState("SHORT");

  if (isLoading) {
    return (
      <div className="card bg-dark text-white p-4 text-center">
        <div className="spinner-border text-primary mx-auto mb-2" role="status"></div>
        <p className="m-0">Gemini AI がマクロデータとニュースを包括分析中...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card bg-dark text-white p-4 text-center">
        <p className="text-muted m-0">「AIシナリオ再生成」ボタンを押すと、AI予測レポートがここに表示されます。</p>
      </div>
    );
  }

  // 現在選択されているタブ (SHORT, MEDIUM, LONG) のシナリオを取得
  const currentScenario = report.scenarios.find((s) => s.term === activeTab) || report.scenarios[0];

  return (
    <div className="card bg-dark text-white">
      <div className="card-header border-secondary d-flex justify-content-between align-items-center">
        <h5 className="m-0">🤖 Gemini AI 多角シナリオ予測</h5>
        <span className="badge bg-warning text-dark">
          マクロ影響度: {report.impactScore} / 10
        </span>
      </div>

      <div className="card-body">
        {/* 市場サマリー */}
        <p className="border-bottom border-secondary pb-3">{report.summary}</p>

        {/* 期間選択タブ */}
        <ul className="nav nav-tabs border-secondary mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "SHORT" ? "active bg-primary text-white" : "text-light"}`}
              onClick={() => setActiveTab("SHORT")}
            >
              短期 (1日~1週)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "MEDIUM" ? "active bg-primary text-white" : "text-light"}`}
              onClick={() => setActiveTab("MEDIUM")}
            >
              中期 (1ヶ月~3ヶ月)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "LONG" ? "active bg-primary text-white" : "text-light"}`}
              onClick={() => setActiveTab("LONG")}
            >
              長期 (3ヶ月~1年)
            </button>
          </li>
        </ul>

        {/* シナリオ詳細コンテンツ */}
        {currentScenario && (
          <div className="row g-3">
            {/* メインシナリオ (Base Case) */}
            <div className="col-md-12">
              <div className="p-3 bg-secondary bg-opacity-25 rounded border border-info">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-info m-0">🎯 メインシナリオ (Base Case)</h6>
                  <span className="badge bg-info text-dark">
                    発生確率: {Math.round(currentScenario.baseCase.probability * 100)}%
                  </span>
                </div>
                <p className="mb-1 fw-bold">
                  予想レンジ: {currentScenario.baseCase.targetPriceRange[0]} ～ {currentScenario.baseCase.targetPriceRange[1]}
                </p>
                <small className="text-light">{currentScenario.baseCase.rationale}</small>
              </div>
            </div>

            {/* ブルシナリオ (強気) */}
            <div className="col-md-6">
              <div className="p-3 bg-secondary bg-opacity-10 rounded border border-success">
                <h6 className="text-success mb-2">📈 ブル（上昇）シナリオ</h6>
                <p className="mb-1 fw-bold">ターゲット: {currentScenario.bullScenario.targetPrice}</p>
                <small className="text-muted">トリガー: {currentScenario.bullScenario.trigger}</small>
              </div>
            </div>

            {/* ベアシナリオ (弱気) */}
            <div className="col-md-6">
              <div className="p-3 bg-secondary bg-opacity-10 rounded border border-danger">
                <h6 className="text-danger mb-2">📉 ベア（下落）シナリオ</h6>
                <p className="mb-1 fw-bold">ターゲット: {currentScenario.bearScenario.targetPrice}</p>
                <small className="text-muted">トリガー: {currentScenario.bearScenario.trigger}</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}