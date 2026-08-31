import React from "react";

/**
 * 相関分析およびマクロ経済指標を表示するパネル
 */
export default function CorrelationPanel({ correlationData, macroIndicators }) {
  // 相関係数の強さに応じたバッジカラーを返却するヘルパー関数
  const getCorrelationBadge = (value) => {
    if (value === undefined || value === null) return <span className="badge bg-secondary">N/A</span>;
    const absVal = Math.abs(value);
    
    let colorClass = "bg-secondary";
    if (absVal >= 0.7) colorClass = value > 0 ? "bg-success" : "bg-danger"; // 強い相関
    else if (absVal >= 0.4) colorClass = "bg-warning text-dark";            // 中程度の相関

    return <span className={`badge ${colorClass}`}>{value > 0 ? `+${value}` : value}</span>;
  };

  return (
    <div className="card bg-dark text-white border-secondary mb-3">
      <div className="card-header border-secondary d-flex justify-content-between align-items-center">
        <h6 className="m-0 font-weight-bold">📈 マクロ相関 & 経済指標</h6>
        <small className="text-muted">過去30日</small>
      </div>

      <div className="card-body p-2">
        {/* 1. マクロ指標要約テーブル */}
        <div className="mb-3">
          <small className="text-secondary d-block mb-1 font-weight-bold">【主要マクロ指標】</small>
          <table className="table table-dark table-sm table-bordered m-0 text-center align-middle">
            <thead>
              <tr className="text-secondary">
                <th>指標名</th>
                <th>現在値</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>米10年金利 (US10Y)</td>
                <td className="text-info fw-bold">{macroIndicators?.us10y ?? "3.85"}%</td>
              </tr>
              <tr>
                <td>原油 (WTI)</td>
                <td>${macroIndicators?.crudeOil ?? "75.20"}</td>
              </tr>
              <tr>
                <td>金 (XAU/USD)</td>
                <td className="text-warning">${macroIndicators?.gold ?? "2,510"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. 多通貨・マクロ相関係数行列 */}
        <div>
          <small className="text-secondary d-block mb-1 font-weight-bold">【連動性・相関係数】</small>
          <div className="list-group list-group-flush border-top border-secondary">
            <div className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center px-1 py-2">
              <small>vs 米ドルインデックス (DXY)</small>
              {getCorrelationBadge(correlationData?.dxy)}
            </div>
            <div className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center px-1 py-2">
              <small>vs 米10年国債金利</small>
              {getCorrelationBadge(correlationData?.us10y)}
            </div>
            <div className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center px-1 py-2">
              <small>vs 金 (Gold)</small>
              {getCorrelationBadge(correlationData?.gold)}
            </div>
            <div className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center px-1 py-2">
              <small>vs 原油 (WTI)</small>
              {getCorrelationBadge(correlationData?.crudeOil)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}