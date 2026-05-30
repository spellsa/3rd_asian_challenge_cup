import React, { useState, useEffect, useRef } from "react";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase/firebase";
import { useNavigate } from "react-router-dom";
import Grass from "./Grass";
import styles from "./Mypage.css";
import Menu from "./Menu";
import { FaPen } from "react-icons/fa";

function Mypage() {
  // ユーザー情報を保存するstate
  const [user, setUser] = useState();

  // リンクに飛ぶためのnavigate
  const navigate = useNavigate();

  // レベルを表示するstate
  const [userLevel, setUserLevel] = useState(0);

  // 次のレベルまでの経験値を表示するstate
  const [toNextExp, setToNextExp] = useState(0);

  // input要素への参照(間接的にクリックするため)
  const profileImageInputRef = useRef(null);

  // 変更した名前を保存するstate
  const [editName, setEditName] = useState("");
  // 名前を変更するかどうかのbool
  const [isEditName, setIsEditName] = useState(false);
  // 前回の名前を保存するstate
  const [beforeEditName, setBeforeEditName] = useState("");

  // イメージファイルを保存するstate
  const [imageFile, setImageFile] = useState(null);
  // イメージファイルのURL
  const [imageFileURL, setImageFileURL] = useState(null);

  // 自分のクイズのstate
  const [myQuiz, setMyQuiz] = useState([]);

  useEffect(() => {
    // 自分のクイズを取得
    const getQuestionMyQuiz = async (user) => {
      try {
        const token = await user.getIdToken(); // アクセストークンの取得
        const res = await fetch(
          // APIから自分のクイズを取得する要請
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
    // レベルの取得
    const getUserLevel = async (user) => {
      try {
        const token = await user.getIdToken(); // アクセストークンの取得
        const res = await fetch(
          // APIからレベルを取得する要請
          "http://localhost:5000/api/get-user-level",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // レスポンスがなかった時の処理
        if (!res.ok) {
          throw new Error("サーバーエラー:" + res.status);
        }
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("レベル取得エラー:", err);
      }
    };
    //ログイン状態の確認
    // firebaseの認証状態を確認するリスナーを設定
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      // ログインしていることを確認したらstateに保存
      if (u) {
        setUser(u);
        setEditName(u.displayName || ""); // 初期表示用
        const my = await getQuestionMyQuiz(u);
        const level = await getUserLevel(u);
        if (my) setMyQuiz(my);
        if (level) {
          setUserLevel(level.currentLevel);
          setToNextExp(level.xpToNextLevel);
        }
      } else {
        // ログインが検出されなかったらtopにも戻る
        navigate("/");
      }
    });
    // このuseEffectが不要になったとき（コンポーネントがアンマウントされたとき）にリスナーを解除してメモリリークを防ぐ
    return () => unsubscribe();
  }, []);

  // 名前を変更するモードに移行
  const handleNameMode = () => {
    setBeforeEditName(editName); // 前回の名前を代入
    setIsEditName(true); // 編集モード移行
  };
  // 名前を変更
  const handleNameChange = (e) => {
    setEditName(e.target.value); //入力した内容を代入
  };
  // 名前の変更を確定した時の処理
  const handleNameSubmit = () => {
    if (editName.replace(/\s/g, "") === "") {
      return handleCancelName();
    }
    setIsEditName(false); // 編集終了
  };
  // 名前の変更をキャンセルした時の処理
  const handleCancelName = () => {
    if (user) {
      setEditName(beforeEditName); // 名前を元に戻す
    }
    setIsEditName(false); // 編集終了
    console.log("キャンセルされました");
  };

  // プロフィール画像の変更
  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileURL(URL.createObjectURL(file));
    }
  };

  // プロフィールの変更を保存
  const handleChangeProfile = async () => {
    if (!user) return;

    try {
      const updateData = {};

      // 名前の変更があるとき
      if (user.displayName !== editName) {
        updateData.displayName = editName;
      }

      // 画像の変更がある場合
      if (imageFile) {
        // ファイルの保存先パスを定義 (例: "profileImages/ユーザーUID.jpg")
        const filePath = `profileImages/${user.uid}_${Date.now()}`;
        const imageRef = ref(storage, filePath);

        // Storage にアップロード
        await uploadBytes(imageRef, imageFile);

        // アップロード後の画像URLを取得
        const downloadURL = await getDownloadURL(imageRef);

        // プロフィール更新に使う
        updateData.photoURL = downloadURL;
      }

      // Firebase Auth のプロフィール更新
      await updateProfile(user, updateData);

      // 状態更新（最新のuser情報で上書き）
      setUser({ ...auth.currentUser });

      // 編集モード終了
      setIsEditName(false);
      setImageFile(null);
      setImageFileURL(null);

      console.log("プロフィール更新完了");
    } catch (error) {
      console.error("プロフィール更新に失敗しました:", error);
    }
  };

  console.log(user);

  return (
    <div class="profile">
      <img
        src={
          // 画像の変更を行った場合はその画像に変更する(してない場合はuserから取得した画像)
          imageFileURL
            ? imageFileURL
            : user?.photoURL
            ? user.photoURL
            : "../初期アイコン.png"
        }
        class="profileIcon"
        onClick={() => profileImageInputRef.current.click()}
        style={{ cursor: "pointer" }}
      />
      <FaPen
        class="FaPenIcon"
        size={40}
        onClick={() => profileImageInputRef.current.click()}
      />
      {isEditName ? (
        <div class="nameEditMode">
          <input
            type="text"
            value={editName}
            onChange={handleNameChange}
            autoFocus
            class="nameEditInput"
          />
          <button onClick={handleNameSubmit} class="submitNameButton">
            <span>確定</span>
          </button>
          <button onClick={handleCancelName} class="cancelNameButton">
            <span>キャンセル</span>
          </button>
        </div>
      ) : (
        // userが存在する場合にその名前を表示
        <>
          <div
            class="userName"
            onClick={handleNameMode}
            style={{ cursor: "pointer" }}
          >
            <span>{user ? editName : "名前を取得しています..."}</span>
            <FaPen class="FaPenName" size={15} color="#aaa" />
          </div>
          {user && (
            /* 変更を保存ボタン
            クラス名を変更されたかどうかで変える
            ユーザーの名前が編集後の名前と違うまたは、変更した画像のURLが存在している場合のみに押せるようにする
             */
            <button
              class={
                user.displayName !== editName || imageFileURL
                  ? "editedChange"
                  : "notEditedChange"
              }
              disabled={!(user.displayName !== editName || imageFileURL)}
              onClick={handleChangeProfile}
            >
              <span>変更を保存</span>
            </button>
          )}
        </>
      )}
      <h2 class="userLevel">
        <span>レベル:{userLevel}</span>
      </h2>
      <h3 class="toNextLevelExp">
        <span>次のレベルまでの経験値:{toNextExp}</span>
      </h3>
      <br />

      <>
        <h2>あなたのクイズ</h2>
        {myQuiz.length === 0 && myQuiz && <h3>クイズがありません</h3>}
        {myQuiz &&
          myQuiz.map((my, i) => (
            <div class="quizLink">
              <a href={`question/${my.questionSetId}`}>
                <h3>{my.title}</h3>
              </a>
            </div>
          ))}
      </>
      {user && (
        // 草を表示するcomponent
        <Grass id={user.accessToken} />
      )}
      <Menu />

      {/* 実際のファイル選択input（非表示） 複数ファイル対応 */}
      <input
        type="file"
        accept="image/*"
        ref={profileImageInputRef}
        onChange={handleProfileImage}
        class="hiddenProfileInput"
      />
    </div>
  );
}

export default Mypage;
