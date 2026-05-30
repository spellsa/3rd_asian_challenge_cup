import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { app } from "./firebase/firebase";

function Login() {
  const [status, setStatus] = useState("ログイン処理中...");
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);
  const hasTriedLogin = useRef(false); // ログイン実行を一度だけに制限

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/";

  useEffect(() => {
    if (hasTriedLogin.current) return;
    hasTriedLogin.current = true;

    const provider = new GoogleAuthProvider();

    // すでにログインしていれば遷移
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setStatus("ダッシュボードにリダイレクトしています...");
        setTimeout(() => {
          navigate(redirectTo);
        }, 1500);
      } else {
        // 未ログインならポップアップでログイン
        signInWithPopup(auth, provider)
          .then((result) => {
            if (result && result.user) {
              setStatus("ログイン成功！");
              setTimeout(() => {
                navigate(redirectTo);
              }, 1500);
            }
          })
          .catch((error) => {
            setStatus("ログインに失敗しました: " + error.message);
          });
      }
    });
  }, []);

  return <div>{status}</div>;
}

export default Login;
