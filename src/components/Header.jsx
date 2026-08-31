import React from "react";

/**
 * アプリケーションのヘッダーおよび操作ナビゲーション
 */
export default function Header({
  selectedSymbol,
  onSymbolChange,
  onRefreshData,
  onRunAI,
  isLoadingData,
  isAnalyzing,
}) {
  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary mb-3 px-3">
      <div className="container-fluid p-0">
        {/* タイトル & プロジェクト名 */}
        <span className="navbar-brand fw-bold text-info fs-4">
          📊 my-macro-analyzer
        </span>

        {/* 右側操作エリア */}
        <div className="d-flex align-items-center gap-2">
          {/* 通貨ペア・対象選択ドロップダウン */}
          <select
            className="form-select form-select-sm bg-dark text-white border-secondary"
            value={selectedSymbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            disabled={isLoadingData || isAnalyzing}
          >
            <option value="USDJPY">USD/JPY (ドル円)</option>
            <option value="EURUSD">EUR/USD (ユーロドル)</option>
            <option value="EURJPY">EUR/JPY (ユーロ円)</option>
          </select>

          {/* データ最新化ボタン */}
          <button
            className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
            onClick={onRefreshData}
            disabled={isLoadingData || isAnalyzing}
          >
            {isLoadingData ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                更新中...
              </>
            ) : (
              "🔄 データ最新化"
            )}
          </button>

          {/* AIシナリオ再生成ボタン */}
          <button
            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
            onClick={onRunAI}
            disabled={isLoadingData || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                AI解析中...
              </>
            ) : (
              "🤖 AIシナリオ再生成"
            )}
          </button>
        </div>
      </div>
    </header>
  );
}