# my-macro-analyzer

> React × Gemini API × Firebaseで構築する、リアルタイム・マクロ経済分析ダッシュボード

`my-macro-analyzer` は、ドル円（USD/JPY）などのFX日足データに加え、米国10年債利回り・WTI原油・金価格（Gold）といったマクロ経済指標を統合し、テクニカル分析（ピボット・トレンドライン自動検出）と統計処理（ピアソン相関係数）を行ったうえで、Googleの最新AI **Gemini API (`@google/genai` SDK / Structured Outputs)** により多角的な予測シナリオレポートを完全自動生成・保存する完全サーバーレスなWebアプリケーションです。

---

## 🌟 主な機能

- **マルチアセット & マクロ相関分析**
  - FX日足データ（USD/JPY等）の自動取得
  - 米国10年債利回り、WTI原油、金価格などのマクロ指標取得とピアソン相関係数による連動性の可視化
- **アルゴリズムによる自動テクニカル解析**
  - **Floor Pivot**（P, R1~R3, S1~S3）の自動算出
  - スライディングウィンドウ探索（Swing High/Low）による局所極値検出と直線方程式によるブレイクアウト判定
- **TradingView Lightweight Charts 統合**
  - 高品質なローソク足チャート上に、ピボット水平線やトレンドライン（斜め線）を動的オーバーレイ描画
- **Gemini API & Structured Outputs 連携**
  - Google公式の最新 `@google/genai` SDKと `responseSchema` を活用し、100%厳密な構造化JSONで短期・中期・長期シナリオ（メイン/ブル/ベア）を生成
- **Firebase Firestore 履歴自動保存**
  - 生成されたAI予測レポートを `serverTimestamp()` 付きで Firestore へ自動保存・永続化
- **API制限対策（フォールバック機能）**
  - 外部API（Alpha Vantage）のレート制限到達時にもアプリをクラッシュさせない擬似ランダムウォークデータ生成機能を搭載

---

## 🏗️ システムアーキテクチャ

```
【 Alpha Vantage API 】 (FX / マクロ指標データ)
        │
        ▼
[ ユーザー (ブラウザ) ] ───▶ 【 Gemini API 】 (gemini-2.5-flash-lite / Structured Outputs)
  Firebase Hosting            │
  (Vite + React SPA)          ▼
                       【 Firebase Firestore 】 (分析履歴の自動保存)
```

---

## 📁 ディレクトリ構造

```
my-macro-analyzer/
├── public/
├── src/
│   ├── assets/             # 静的画像リソース
│   ├── components/         # UIコンポーネント群
│   │   ├── Header.jsx           # ナビゲーション & アクションヘッダー
│   │   ├── MainChart.jsx        # Lightweight Charts 描画コンポーネント
│   │   ├── CorrelationPanel.jsx # マクロ相関行列テーブル & バッジ表示
│   │   └── AIScenarioPanel.jsx  # Gemini AI予測シナリオカード（タブ切り替え）
│   ├── services/           # 外部API通信ロジック
│   │   ├── marketData.js        # Alpha Vantage API取得 & フォールバック処理
│   │   └── gemini.js            # Gemini API呼び出し & Structured Outputs設定
│   ├── utils/              # テクニカル & 統計計算モジュール（純粋関数）
│   │   ├── pivot.js             # Floor Pivot（標準ピボット）計算
│   │   ├── trendline.js         # Swing High/Low検出 & ブレイクアウト判定
│   │   └── correlation.js       # ピアソンの積率相関係数算出
│   ├── App.jsx             # アプリケーション全体のSingle Source of Truth & 同期パイプライン
│   ├── firebase.js         # Firebase SDK初期化
│   └── main.jsx            # Reactエントリーポイント
├── .env                    # 環境変数（APIキー等）
├── firebase.json           # Firebase Hosting / Firestore設定
├── firestore.rules         # Firestoreセキュリティルール
├── index.html              # エントリーHTML
├── package.json
└── vite.config.js          # Vite設定ファイル
```

---

## 🛠️ 開発環境の構築手順

### 1. リポジトリのクローンと依存パッケージのインストール

```bash
git clone https://github.com/your-username/my-macro-analyzer.git
cd my-macro-analyzer
npm install
```

### 2. 環境変数（`.env`）の設定

ルートディレクトに `.env` ファイルを作成し、各種APIキーおよびFirebase接続情報を設定してください。

```env
# Alpha Vantage API Key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

### 3. ローカル開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスして動作用確認を行います。

---

## 🚀 ビルドと Firebase Hosting へのデプロイ

### 1. 本番用ビルド

```bash
npm run build
```

### 2. Firebase へのデプロイ

```bash
npx firebase login
npx firebase deploy --only hosting
```

---

## 🧰 使用技術スタック (Tech Stack)

- **Frontend**: React 18, Vite, Bootstrap 5, Bootstrap Icons
- **Chart**: Lightweight Charts (TradingView)
- **AI**: `@google/genai` (Gemini 2.5 Flash-Lite / Structured Outputs)
- **Backend / Database**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **External API**: Alpha Vantage API (FX / Commodity / Yield)

---

## 📄 ライセンス & 著作者

- **著者**: 吉田泰雄
- **協力**: Google Gemini