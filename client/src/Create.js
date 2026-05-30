// react関連のインポート
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// css, コンポーネントのインポート
import styles from "./Create.css";
import Menu from "./Menu";
import LoadingDot from "./LoadingDot";
// データベース関連のインポート(firebase.jsからインポート)
import { storage } from "./firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaFilePdf } from "react-icons/fa6";
import { FaImages } from "react-icons/fa";
import { RiAiGenerate } from "react-icons/ri";

function CreateQuestion() {
  //ユーザーデータ
  const [user, setUser] = useState(null);

  // 問題を作成中かを判断するbool
  const [isGenerate, setIsGenerate] = useState(false);

  // ロード中かどうかのbool
  const [loading, setLoading] = useState(true);

  // input要素への参照（ボタンから間接的にclickするため）
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  // ファイルを保存するstate（複数ファイル対応）
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState(""); // "image", "pdf"（複数可）

  // プレビュー用のURLを保存するstate（配列で保持）
  const [imageUrl, setImageUrl] = useState(null); // 画像用のURL配列
  const [pdfUrl, setPdfUrl] = useState(null); // PDF用のURL配列

  const navigate = useNavigate(); //リンクに飛ぶためのナビゲート

  useEffect(() => {
    //ログイン状態の確認
    // firebaseの認証状態を確認するリスナーを設定
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      // ログインしていることを確認したらstateに保存
      if (u) {
        setUser(u);
      } else {
        // ログインが検出されなかったらtopにも戻る
        navigate("/");
      }
    });
    // このuseEffectが不要になったとき（コンポーネントがアンマウントされたとき）にリスナーを解除してメモリリークを防ぐ
    return () => unsubscribe();
  }, []);

  // 画像ファイルが選択されたときの処理（複数対応）
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      const urls = files.map((file) => URL.createObjectURL(file)); // 各画像のプレビューURL作成
      setSelectedFiles(files); // 複数ファイルをstateに保存
      setImageUrl(urls); // プレビュー用
      setPdfUrl(null); // PDFの表示はクリア
      setFileType("image");
    }
    event.target.value = null; // 同じファイルを再選択できるようにする
  };

  // PDFファイルが選択されたときの処理（複数対応）
  const handlePdfChange = (event) => {
    const files = Array.from(event.target.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      const urls = files.map((file) => URL.createObjectURL(file)); // 各PDFのプレビューURL作成
      setSelectedFiles(files); // 複数ファイルをstateに保存
      setPdfUrl(urls);
      setImageUrl(null); // 画像の表示はクリア
      setFileType("pdf");
    }
    event.target.value = null; // 同じファイルを再選択できるようにする
  };

  // 問題のジェネレートとファイルをデータベースに送信（複数ファイル対応）
  const handleClick = async () => {
    try {
      // ファイルがない時
      if (!selectedFiles || selectedFiles.length === 0) {
        alert("ファイルが選択されていません。");
        return;
      }

      setIsGenerate(true); //生成中と表示するためにisGenerateをtrueに

      const downloadURLs = [];

      // 選択されたファイルすべてをFirebaseにアップロード
      for (const file of selectedFiles) {
        const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        downloadURLs.push(url);
      }

      const token = await user.getIdToken(); // Tokenを保存
      // 複数のURLをAPIに送信
      const response = await fetch(
        "http://localhost:5000/api/generate-question-set",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ downloadURLs: downloadURLs }), // 複数URLを配列で送信
        }
      );

      if (!response.ok) {
        throw new Error("ネットワーク応答が不正です");
      }

      const responseData = await response.json();
      console.log(responseData); // jsonファイルの中身を確認

      const address = responseData.id;

      if (address) {
        navigate(`/question/${address}`);
      } else {
        alert("idの取得に失敗しました");
        throw new Error("アドレスがレスポンスに含まれていません");
      }
    } catch (error) {
      console.error("アップロード失敗:", error);
    } finally {
      setLoading(false); // エラーが発生or正常に動作した後にロード中フラグを下げる
    }
  };

  return (
    <>
      {!isGenerate ? (
        <div class="fileUploader">
          {/* プレビュー表示エリア */}
          <div class="previewContainer">
            {imageUrl ? (
              <div>
                {/* 複数画像をマッピング表示 */}
                {imageUrl.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`画像プレビュー${index}`}
                    class="imagePreview"
                  />
                ))}
                <button class="generateButton" onClick={handleClick}>
                  <RiAiGenerate size={25} />
                  <span>問題をジェネレート</span>
                </button>
              </div>
            ) : pdfUrl ? (
              <div>
                {/* 複数PDFをマッピング表示 */}
                {pdfUrl.map((url, index) => (
                  <iframe
                    key={index}
                    src={url}
                    title={`PDFプレビュー${index}`}
                    class="pdfPreview"
                  ></iframe>
                ))}
                <button class="generateButton" onClick={handleClick}>
                  <RiAiGenerate size={25} />
                  <span>問題をジェネレート</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* 画像選択ボタン */}
          <button
            class="uploadButton"
            onClick={() => imageInputRef.current.click()}
          >
            <FaImages size={25} />
            <span>画像で作成</span>
          </button>
          {/* 実際のファイル選択input（非表示） 複数ファイル対応 */}
          <input
            type="file"
            accept="image/*"
            multiple
            ref={imageInputRef}
            onChange={handleImageChange}
            class="hiddenInput"
          />

          {/* PDF選択ボタン */}
          <button
            class={
              !selectedFiles || selectedFiles.length === 0
                ? "notUploadButton"
                : "uploadButton"
            }
            onClick={() => pdfInputRef.current.click()}
          >
            <FaFilePdf size={25} />
            <span>PDFで作成</span>
          </button>
          {/* 実際のPDFファイル選択input（非表示） 複数ファイル対応 */}
          <input
            type="file"
            accept="application/pdf"
            multiple
            ref={pdfInputRef}
            onChange={handlePdfChange}
            class="hiddenInput"
          />

          <Menu />
        </div>
      ) : (
        <div>
          {/* ロード中の時の処理 or リンクに飛べなかったときの処理 */}
          {loading ? (
            <p class="questionMaking">
              <div class="loader"></div>
              <span class="message_1">問題を生成中</span>
              <LoadingDot />
              <br />
              <span class="message_2">もう少しお待ちください</span>
            </p>
          ) : (
            <p>問題の生成に失敗しました</p>
          )}
        </div>
      )}
    </>
  );
}

export default CreateQuestion;
