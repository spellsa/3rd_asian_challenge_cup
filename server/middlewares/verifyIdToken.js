import { auth } from "../firebase/firebase.js"; // 自作のFirebase設定からインポート

// firebase IDトークンの検証ミドルウェア
const verifyIdToken = async (req, res, next) => {
  if (!req.token) {
    return res.status(401).json({ error: "認証トークンがありません" });
  }

  try {
    // Firebase Admin SDKを使用してIDトークンを検証
    const decodedToken = await auth.verifyIdToken(req.token);
    req.user = decodedToken; // 検証されたユーザー情報をリクエストに追加
    next();
  } catch (error) {
    console.error("IDトークンの検証に失敗しました。:", error);
    res.status(401).json({ error: "認証トークンが無効です" });
  }
};

export default verifyIdToken; // defaultを使っているためimport時には{ }を使わない
