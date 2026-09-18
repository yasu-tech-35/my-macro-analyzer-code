import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// .env から設定情報を読み込み
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase の初期化
const app = initializeApp(firebaseConfig);

// データベース(Firestore)と認証(Auth)のインスタンスをエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);

// アプリ起動時に匿名ログインを実行
signInAnonymously(auth).catch((error) => {
  console.error("Firebase 匿名認証エラー:", error);
});