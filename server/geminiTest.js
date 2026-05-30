import { GoogleGenAI, Type, createPartFromUri } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const { uploadedFiles, tempFilePaths } = await downloadFileAndUploadToGemini(["https://firebasestorage.googleapis.com/v0/b/rd-asichalle.firebasestorage.app/o/uploads%2FScreenshot%202025-06-15%20122054.png?alt=media&token=227f20e7-3b4f-431f-847d-a0f2823c148a", "https://firebasestorage.googleapis.com/v0/b/rd-asichalle.firebasestorage.app/o/uploads%2F1750229447716_PXL_20250618_012224104.jpg?alt=media&token=1f2cf326-4396-4218-8436-285e0bbc81d8"]);
  const content = ["この画像を見て、日本語で内容を説明してください。ユーザーIDはuser123と入力してください"];
  content.push(...uploadedFiles); // 配列を展開して追加

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["createdUserId", "createdAt", "title", "outline", "questions"],
        propertyOrdering: ["createdUserId", "createdAt", "title", "outline", "questions"],
        properties: {
          createdUserId: {
            // 問題セットを作成したユーザーのID
            nullable: true,
            type: Type.STRING, // ユーザーIDはnullで、後で付与する
          },
          createdAt: {
            // 問題セットの作成日時
            nullable: true,
            type: Type.STRING, // 日時はnullで、後で付与する
          },
          title: {
            // 問題セットのタイトル
            type: Type.STRING,
          },
          outline: {
            // 問題セットの概要
            type: Type.STRING,
          },
          questions: {
            // 問題セットの配列
            type: Type.ARRAY,
            items: {
              anyOf: [
                // true_falseタイプの問題
                {
                  type: Type.OBJECT,
                  properties: {
                    questionType: {
                      // 問題のタイプ
                      type: Type.STRING,
                      enum: ["true_false"],
                    },
                    questionId: {
                      // 問題一問に対して付与されるID
                      nullable: true,
                      type: Type.STRING, // IDはnullで、後で付与する
                    },
                    question: {
                      // 問題文
                      type: Type.STRING,
                    },
                    answer: {
                      // 正解の選択肢
                      type: Type.BOOLEAN,
                    },
                    explanation: {
                      // 問題の解説
                      type: Type.STRING,
                    },
                  },
                  //propertyOrdering: ["questionType", "questionId", "question", "answer", "explanation"],
                  //required: ["questionType", "questionId", "question", "answer", "explanation"],
                },
              ],
            },
          },
        },
      },
    },
  });
  console.log(response.text);
}

async function downloadFileAndUploadToGemini(downloadURLs) {
  const uploadedFiles = [];
  const tempFilePaths = [];

  for (const downloadURL of downloadURLs) {
    console.log("ダウンロードURL:", downloadURL);
    const filePath = await downloadFileFromURL(downloadURL); // URLからダウンロード
    // 一時ファイルのパスを保存
    tempFilePaths.push(filePath);
    const uploadedFile = await uploadFileToGemini(filePath); // FileAPIを使用してアップロード
    // アップロードされたファイルを配列に追加
    uploadedFiles.push(createPartFromUri(uploadedFile.uri, uploadedFile.mimeType));
  }
  return { uploadedFiles, tempFilePaths };
}

// URLからファイルをダウンロードし、そのtempパスを返す関数
async function downloadFileFromURL(downloadURL) {
  const urlObj = new URL(downloadURL);
  const pathParam = urlObj.pathname.split("/o/")[1]; // /o/以降のパスを取得
  const decodedPath = decodeURIComponent(pathParam); // パスをデコード
  const fileName = decodedPath.split("/").pop(); // ファイル名を取得

  const destinationPath = `./tempFiles/${fileName}`; //保存先のパス

  // ファイルをFireStorageからダウンロード
  const fetchResponse = await fetch(downloadURL); //responseオブジェクトを取得
  if (!fetchResponse.ok) {
    throw new Error(`ファイルのダウンロードに失敗しました: ${fetchResponse.statusText}`);
  }
  const buffer = await fetchResponse.arrayBuffer(); //responseからArrayBufferを取得
  await fs.writeFile(destinationPath, Buffer.from(buffer)); //ArrayBufferをbufferに変換してファイルに書き込む
  console.log("ファイルをダウンロードしました:", destinationPath);
  return destinationPath;
}

// ファイルをGeminiにアップロードする関数
async function uploadFileToGemini(filePath) {
  const fileName = path.basename(filePath); // ファイル名を取得
  const fileExtension = path.extname(fileName).toLowerCase(); // ファイルの拡張子を取得

  let mineType;
  // ファイルの拡張子に応じてMIMEタイプを設定
  switch (fileExtension) {
    case ".png":
      mineType = "image/png";
      break;
    case ".jpg":
    case ".jpeg":
      mineType = "image/jpeg";
      break;
    case ".pdf":
      mineType = "application/pdf";
      break;
    case ".txt":
      mineType = "text/plain";
      break;
    default:
      throw new Error(`サポートされていないファイル形式です: ${fileExtension}`);
  }

  // FileAPIを使用して、Geminiが読み込めるようにファイルをアップロード
  const _uploadedFile = await ai.files.upload({
    file: filePath,
    config: { mimeType: mineType },
  });
  console.log("アップロードが完了しました　Uploaded URL:", _uploadedFile.uri, "MIME Type:", _uploadedFile.mimeType);
  return _uploadedFile;
}

main();
