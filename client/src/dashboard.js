import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./Dashboard.css";
import AppButton from "./AppButton";
import Menu from "./Menu";

function Dashboard() {
  //ユーザーデータ
  const [user, setUser] = useState(null);
  // ナビゲート
  const navigate = useNavigate();
  // 閲覧履歴のstate
  const [recentQuiz, setRecentQuiz] = useState([]);
  // 自分のクイズのstate
  const [myQuiz, setMyQuiz] = useState([]);

  useEffect(() => {
    // 問題の閲覧履歴を取得
    const getQuestionLog = async (user) => {
      try {
        const token = await user.getIdToken(); // アクセストークンの取得
        const res = await fetch(
          // 外部読み込み
          "http://localhost:5000/api/get-recently-answered-questionSets",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // responseがなかった時
        if (!res.ok) {
          throw new Error("サーバーエラー: " + res.status);
        }

        const data = await res.json(); // JSONに変換
        return data;
      } catch (err) {
        console.error("getQuestionLog エラー:", err);
        return null; // 失敗したときはnullを返す
      }
    };
    // 自分のクイズを取得
    const getQuestionMyQuiz = async (user) => {
      try {
        const token = await user.getIdToken(); // アクセストークンの取得
        const res = await fetch(
          // 外部読み込み
          "http://localhost:5000/api/get-my-questionSets",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // responseがなかった時
        if (!res.ok) {
          throw new Error("サーバーエラー: " + res.status);
        }

        const data = await res.json(); // JSONに変換
        return data;
      } catch (err) {
        console.error("getQuestionLog エラー:", err);
        return null; // 失敗したときはnullを返す
      }
    };
    //ログイン状態の確認
    // firebaseの認証状態を確認するリスナーを設定
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      // ログインしていることを確認したらstateに保存
      if (u) {
        setUser(u);
        const log = await getQuestionLog(u);
        const my = await getQuestionMyQuiz(u);
        if (log) setRecentQuiz(log);
        if (my) setMyQuiz(my); 
      } else {
        // ログインが検出されなかったらtopにも戻る
        navigate("/");
      }
    });
    // このuseEffectが不要になったとき（コンポーネントがアンマウントされたとき）にリスナーを解除してメモリリークを防ぐ
    return () => unsubscribe();
  }, []);

  console.log(user);
  console.log(recentQuiz);
  console.log(myQuiz);
  return (
    <div class="all">
      <div class="App">
        <Link to="/" class="titleLink">
          <img src="../AIDY.svg" class="DashboardLogo"></img>
        </Link>
        <Link to="/create" class="createLink">
          問題を作る
        </Link>
        <Link to="/mypage">
          {/* userが存在する場合はそのphotoURLを表示,存在しない場合は初期アイコン */}
          <img
            src={user ? user.photoURL : "../初期アイコン.png"}
            class="icon"
          ></img>
        </Link>
      </div>
      <AppButton recent={recentQuiz} myQuiz={myQuiz} />
      <Menu />
    </div>
  );
}
export default Dashboard;
