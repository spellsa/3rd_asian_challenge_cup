import React, { useState, useEffect } from "react";
import {
  useLocation,
  useParams,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import styles from "./Answer.css";
import LoadingDot from "./LoadingDot";
import Menu from "./Menu";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

function Answer() {
  //ユーザーデータ
  const [user, setUser] = useState(null);

  // URLからidを取得
  const { id } = useParams();

  // question.jsから渡されたstateを取得
  const location = useLocation();

  // locationのstateから問題と回答のデータを取り出す(データがない場合は空文字)
  const { questions, answers } = location.state || {};

  // リダイレクト用のメソッドを取得
  const navigate = useNavigate();

  // 点数のstate
  const [score, setScore] = useState(0);

  // indexをkeyにした記述問題の採点結果を保存するstate
  const [freeTextGrades, setFreeTextGrades] = useState({});

  // AIによる採点中かどうかのboolを保存するstate
  const [isGrading, setIsGrading] = useState(false);

  // リロード検知API
  const navType = useNavigationType();

  // バックに回答データを送信済みかのbool
  const [isPost, setIsPost] = useState(false);

  // フォローアップ問題作成用のデータ
  const [followUpData, setFollowUpData] = useState(null);

  // レベル関連の情報データ
  const [levelData, setLevelData] = useState(null);

  // フォローアップ問題の作成状態になったかのbool
  const [isMakeFollowUp, setIsMakeFollowUp] = useState(false);
  // フォローアップの作成が完了したかのbool
  const [getFollowUp, setGetFollowUp] = useState(false);
  // フォローアップ問題のIDを保存するstate
  const [followUpId, setFollowUpId] = useState(null);

  // リロードの時はquestionに返す
  useEffect(() => {
    if (navType === "POP") {
      navigate(`/question/${id}`);
    }
  }, [navType, navigate]);

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

  // free_text_inputをまとめて採点用に送信
  useEffect(() => {
    // 問題または答えがないときはそのまま返す
    if (!questions || !answers) return;

    // 記述の採点メソッド
    const sendGradingRequest = async () => {
      // 記述問題の時に、json形式で送信する連想配列
      const freeTextPayload = questions
        // mapを使って要素をそれぞれ代入していく
        .map((q, i) => {
          if (q.questionType === "free_text_input") {
            return {
              index: i, // 後でmapで使うためにindexを保持(serverに送信はしない)
              question: q.question, // 問題文
              answer: q.answer, // 模範解答
              explanation: q.explanation, // 問題の説明
              userAnswer: answers[i], // ユーザーの回答
              gradingCriteria: q.gradingSettings.gradingCriteria, // 採点基準
            };
          }
          // 形式が記述じゃなかったらnullを返す
          return null;
        })
        .filter(Boolean); // nullの要素を除去(true,falseのみ)

      // 記述問題がなかった時に送信しない
      if (freeTextPayload.length === 0) return;

      try {
        // 採点中のフラグを立てる
        setIsGrading(true);
        // データの送信
        const response = await fetch(
          "http://localhost:5000/api/grade-free-text",
          {
            method: "POST", //形式はpost
            headers: { "Content-Type": "application/json" },
            // indexを変数として取り出し、残りのオブジェクトをrestに代入。そしてrestだけをかえす。その処理をマップで全要素に行う
            body: JSON.stringify(
              freeTextPayload.map(({ index, ...rest }) => rest)
            ), //連想配列をjson化して送信(indexは送信しない)
          }
        );

        // サーバー側が応答しなかったときにエラー処理
        if (!response.ok) {
          throw new Error(`HTTPエラー: ${response.status}`);
        }

        const resultArray = await response.json(); // responseをjsonに変換

        const result = {}; // 採点結果(index: 結果 と代入する連想配列)
        // forEachで採点結果をresultに代入
        resultArray.forEach((res, idx) => {
          const questionIndex = freeTextPayload[idx].index; // 元の質問のindexを取得(resultArayとfreeTextPayloadの順番は一致しているため)
          result[questionIndex] = res; // indexをキーとして採点結果(res)を代入
        });
        setFreeTextGrades(result); // 採点結果を保存するstateに代入
      } catch (error) {
        console.error("AI採点中にエラーが発生しました", error);
      } finally {
        // 採点終了
        setIsGrading(false);
      }
    };

    // メソッドの実行
    sendGradingRequest();
  }, [questions, answers]);

  // 点数計算と回答データの送信(レベルの判定も送信)
  useEffect(() => {
    // 質問や回答が存在しないとき
    if (!questions || !answers || isGrading) return;

    let count = 0; // 点数

    // 回答データ
    const answerData = {
      questionSetId: id,
      incorrectQuestionIds: [],
      incorrectAnswerDetails: [],
    };

    // 問題に正解していたらcountを増やすという動作を各要素で行う
    questions.forEach((q, i) => {
      // 要素がundefinedの場合はreturn
      if (answers[i] === undefined) {
        answerData.incorrectQuestionIds.push(q.questionId);
        const answerDetails = {
          questionId: q.questionId,
          question: q.question,
          userAnswer: null,
          correctAnswer: q.anser,
          explanation: q.explanation,
          questionType: q.questionType,
          gradingCriteria: null,
        };
        answerData.incorrectAnswerDetails.push(answerDetails);
        return;
      }

      // 記述採点の時とそれ以外で処理を分割
      if (q.questionType === "free_text_input") {
        // sendGradingRequest()で処理したAIからの採点結果がtrueの時に点数を追加
        if (freeTextGrades[i]?.isCorrect) {
          count++;
        } else {
          // falseなら間違えた問題のデータに追加
          answerData.incorrectQuestionIds.push(q.questionId);
          const answerDetails = {
            questionId: q.questionId,
            question: q.question,
            userAnswer: answers[i],
            correctAnswer: q.anser,
            explanation: q.explanation,
            questionType: q.questionType,
            gradingCriteria: q.gradingSettings.gradingCriteria,
          };
          answerData.incorrectAnswerDetails.push(answerDetails);
        }
      } else {
        // ユーザーの回答と模範解答の「"」「 」を除いたものをそれぞれ代入
        const userAnswer = JSON.stringify(answers[i])
          .replace(/"/g, "")
          .replace(/\s/g, "");
        const modelAnswer = JSON.stringify(q.answer)
          .replace(/"/g, "")
          .replace(/\s/g, "");
        // ユーザーの回答と模範解答が同じときに点数を追加
        if (userAnswer === modelAnswer) {
          count++;
        } else {
          // falseなら間違えた問題のデータに追加
          answerData.incorrectQuestionIds.push(q.questionId);
          const answerDetails = {
            questionId: q.questionId,
            question: q.question,
            userAnswer: answers[i],
            correctAnswer: q.anser,
            explanation: q.explanation,
            questionType: q.questionType,
            gradingCriteria: null,
          };
          answerData.incorrectAnswerDetails.push(answerDetails);
        }
      }
    });
    // 回答データを送信
    const sendAnswerData = async () => {
      try {
        // データの送信
        if (!isGrading && !isPost && user) {
          // userトークン
          const token = await user.getIdToken();
          console.log(token);
          const res = await fetch(
            "http://localhost:5000/api/save-user-answer-logs",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(answerData),
            }
          );
          if (!res.ok) {
            throw new Error("サーバーエラー: " + res.status);
          }
          const sendAnswerData = await res.json();
          console.log("サーバーからのレスポンス:", sendAnswerData);
          setFollowUpData(sendAnswerData);
        }
      } catch (err) {
        console.error("getQuestionLog エラー:", err);
      }
    };
    // 点数を送信してレベルの変更をバックに要請
    const sendScoreData = async (score) => {
      try {
        // データの送信
        if (!isGrading && !isPost && user) {
          // userトークン
          const token = await user.getIdToken();
          // 送信データ
          const sendScore = {
            correctAnswersCount: score,
          };
          // 点数のデータを送信
          const res = await fetch("http://localhost:5000/api/give-experience", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(sendScore),
          });
          if (!res.ok) {
            throw new Error("サーバーエラー: " + res.status);
          }
          const sendLevelData = await res.json();
          console.log("与えられた経験値", sendLevelData);
          setLevelData(sendLevelData);
          setIsPost(true);
        }
      } catch (err) {
        console.error("Score送信エラー:", err);
      }
    };
    sendAnswerData();
    setScore(count);
    sendScoreData(score);
  }, [questions, answers, freeTextGrades]);

  // 選択したページの戻る処理
  const navigateTo = (link) => {
    // navigateで戻る
    navigate(link);
  };

  // ページを戻るボタンのコンポーネント
  const backPage = () => {
    return (
      <div class="backPage">
        <button onClick={() => navigateTo("/dashboard")} class="backTop">
          <span>ホームに戻る</span>
        </button>
        {id && (
          <button
            onClick={() => navigateTo(`/question/${id}`)}
            class="backQuestion"
          >
            <span>もう一度解く</span>
          </button>
        )}
      </div>
    );
  };

  // idがない or stateが空の時の処理
  if (!id || !location.state) {
    return (
      <div class="notFoundAPI">
        <h2 class="notFoundError">
          <span>エラー：回答が見つかりません</span>
        </h2>
        <p class="notFoundExplanation">
          このページは問題に回答してからアクセスする必要があります。
        </p>
        {backPage()}
      </div>
    );
  }

  // フォローアップ問題の作成
  const handleFolowUp = async () => {
    // フォローアップのログIDが存在する時
    if (followUpData != null) {
      try {
        // フォローアップ問題を作成中のboolをtrue
        setIsMakeFollowUp(true);
        // userトークン
        const token = await user.getIdToken();
        // フォローアップのログIDを取得
        const sendFollowUpId = await followUpData.answerLogId;

        const res = await fetch(
          "http://localhost:5000/api/generate-follow-up-questions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ answerLogId: sendFollowUpId }),
          }
        );
        if (!res.ok) {
          throw new Error("サーバーエラー:" + res.status);
        }
        const idData = await res.json();
        console.log("フォローアップ問題のID", idData);
        // フォローアップ問題のquesitonIdを代入
        setFollowUpId(idData.followUpSetId);
        // 問題の生成を完了したのでstateを変更
        setGetFollowUp(true);
      } catch (err) {
        console.error("フォローアップ問題の生成中エラー:", err);
      }
    } else {
      // フォローアップ問題のログが存在しない旨を表示する
      return (
        <p>
          フォローアップ問題のログが存在しません。しばらく待ってからやり直してください
        </p>
      );
    }
  };
  // フォローアップ問題に遷移するメソッド
  const handleToFollowUp = () => {
    if(followUpId !== null){
      navigate(`/question/${followUpId}`);
      console.log("a");
    }
  };

  // それぞれの形式に合わせた問題と回答を表示メソッド(めっちゃ長いから頑張って読んでね)
  const renderAComponet = (q, i, userAnswer, modelAnswer) => {
    switch (q.questionType) {
      case "true_false": // 〇✖問題
        // ユーザーの回答と模範解答をtruefalseから〇✖に(新しい定数を作って)
        const userAnswerTrueFalse = userAnswer ? "〇" : "×";
        const modelAnswerTrueFalse = modelAnswer ? "〇" : "×";
        return (
          <div class="trueFalseAnswer">
            <h3 class="trueFalseStatement">
              <span>{q.question}</span>
            </h3>
            <h3 class="userAnswerTrueFalse">
              <span>あなたの回答: {userAnswerTrueFalse}</span>
            </h3>
            <h3 class="modelAnswerTrueFalse">
              <span>模範解答: {modelAnswerTrueFalse}</span>
            </h3>
          </div>
        );
      case "fill_in_the_blank": // 穴埋め問題
        return (
          <div class="fillInTheBlankAnswer">
            <h3 class="fillInTheBlankStatement">
              {q.question.map((blank, index) => (
                // mapを使って分割された問題の配列と回答欄を順番に表示
                <React.Fragment key={`blank-${index}`}>
                  {/* 問題文 */}
                  {blank}
                  {/* 回答欄 */}
                  {index + 1 < q.question.length && (
                    // 読み取り専用のinputに回答を入れる
                    <input
                      type="text"
                      class="FillInTheBlankResponse"
                      value={`回答${index + 1}:${
                        Array.isArray(answers[i]) ? answers[i][index] ?? "" : ""
                      }`}
                      readOnly
                    />
                  )}
                </React.Fragment>
              ))}
            </h3>
            <h3 class="modelAnswerFillInTheBlank">
              <span>模範解答: </span>
              {Array.isArray(q.answer) &&
                q.answer.map((modelAnswer, index) => (
                  <span>{`回答${index + 1}: ${modelAnswer} `}</span>
                ))}
            </h3>
          </div>
        );
      case "single_choice": // 選択問題(回答一つ)
        return (
          <div class="singleChoiceAnswer">
            <h3 class="singleChoiceStatement">
              <span>{q.question}</span>
            </h3>
            <h3 class="userAnswerSingleChoice">
              <span>あなたの回答: </span>
              {q.options.map((option, index) => (
                <label
                  key={`optionUserAnswer-${i}-${index}`}
                  class="checkBoxSingleChoice"
                >
                  <input
                    type="button"
                    name={`userAnswer-${i}`}
                    value={option}
                    checked={userAnswer === option}
                    class={
                      userAnswer === option
                        ? "answerSingleChoice"
                        : "notAnswerSingleCohice"
                    }
                    readOnly
                  />
                </label>
              ))}
            </h3>
            <h3 class="modelAnswerSingleChoice">
              <span>模範解答: </span>
              {q.options.map((option, index) => (
                <label
                  key={`optionModelAnswer-${i}-${index}`}
                  class="checkBoxSingleChoice"
                >
                  <input
                    type="button"
                    name={`modelAnswer-${i}`}
                    value={option}
                    checked={modelAnswer === option}
                    class={
                      modelAnswer === option
                        ? "answerSingleChoice"
                        : "notAnswerSingleCohice"
                    }
                    readOnly
                  />
                </label>
              ))}
            </h3>
          </div>
        );
      case "multiple_choice": // 選択問題(回答複数)
        return (
          <div class="multipleChoiceAnswer">
            <h3 class="multipleChoiceStatement">
              <span>{q.question}</span>
            </h3>
            <h3 class="userAnswerMultipleChoice">
              <span>あなたの回答: </span>
              {q.options.map((option, index) => (
                <label
                  key={`multiUserAnswer-${i}-${index}`}
                  class="checkBoxMultipleChoice"
                >
                  {Array.isArray(answers[i]) && (
                    <input
                      type="button"
                      name={`multiUserAnswer-${i}`}
                      value={option}
                      checked={answers[i][index] === true}
                      class={
                        answers[i][index] === true
                          ? "answerMultipleChoice"
                          : "notAnswerMultipleCohice"
                      }
                      readOnly
                    />
                  )}
                </label>
              ))}
            </h3>
            <h3 class="modelAnswerMultipleChoice">
              <span>模範解答: </span>
              {q.options.map((option, index) => (
                <label
                  key={`multiModelAnswer-${i}-${index}`}
                  class="checkBoxMultipleChoice"
                >
                  {Array.isArray(q.answer) && (
                    <input
                      type="button"
                      name={`multiUserAnswer-${i}`}
                      value={option}
                      checked={q.answer[index] === true}
                      class={
                        q.answer[index] === true
                          ? "answerMultipleChoice"
                          : "notAnswerMultipleCohice"
                      }
                      readOnly
                    />
                  )}
                </label>
              ))}
            </h3>
          </div>
        );
      case "free_text_input":
        return (
          <div class="freeTextAnswer">
            <h3 class="freeTextStatement">
              <span>{q.question}</span>
            </h3>
            <h3 class="userAnswerFreeText">
              <span>あなたの回答: {userAnswer}</span>
            </h3>
            <h3 class="modelAnswerFreeText">
              <span>模範解答: {modelAnswer}</span>
            </h3>
            {/* 採点AIからの解説も表示 */}
            {freeTextGrades[i] && (
              <h4 class="aiExplanation">
                <span>AIによる解説: {freeTextGrades[i].explanation}</span>
              </h4>
            )}
          </div>
        );
      default: // それ以外(計算)
        return (
          <div class="elseAnswer">
            <h3 class="elseStatement">
              <span>{q.question}</span>
            </h3>
            <h3 class="userAnswerElse">
              <span>あなたの回答:{userAnswer}</span>
            </h3>
            <h3 class="modelAnswerElse">
              <span>模範解答:{modelAnswer}</span>
            </h3>
          </div>
        );
    }
  };

  return (
    <div class="answer">
      <Menu />
      <h2 class="answerTitle">
        <span>
          回答結果 点数:{score}/{questions.length}
        </span>
      </h2>
      {levelData && (
        <div class="answerLevel">
          <h2 class="answerCurrentLevel">
            <span>現在のレベル:{levelData.currentLevel}</span>
          </h2>
          <h3 class="answerToNextLevel">
            <span>次のレベルまでの経験値:{levelData.xpToNextLevel}</span>
          </h3>
        </div>
      )}
      {isGrading && (
        <h3 class="gradingMessage">
          <span>記述問題採点中</span>
          <LoadingDot />
        </h3>
      )}
      <div class="questionDescription">
        {questions.map((q, i) => {
          // undefinedの時は空文字に変換
          const userRaw = answers[i] !== undefined ? answers[i] : "";
          // ユーザーの回答(配列やtrue,falseを表示するためにJSON.stringify()で表示し、その弊害に含まれる「"」を表示上でのみ削除)
          const userAnswer = JSON.stringify(userRaw).replace(/"/g, "");
          // 模範回答(配列やtrue,falseを表示するためにJSON.stringify()で表示し、その弊害に含まれる「"」を表示上でのみ削除)
          const modelAnswer = JSON.stringify(q.answer).replace(/"/g, "");
          // 正誤判定(空白は含めない gは「全て(global)」という意味)
          const isCorrect =
            q.questionType === "free_text_input" // 記述問題の時はAIによる採点結果がtrueなら正解という処理
              ? freeTextGrades[i]?.isCorrect
              : userAnswer.replace(/\s/g, "") ===
                modelAnswer.replace(/\s/g, "");

          return (
            <div class="answerResult">
              {/* 正誤判定 */}
              <h3>
                <span class="answerNumber">問題{i + 1}</span>
                <span class="correction">
                  {isCorrect ? ( // isCorrectがtrueの時は正解と表示
                    <span class="correct">正解!</span>
                  ) : (
                    <span class="wrong">不正解</span>
                  )}
                </span>
              </h3>
              {/* 問題と回答の表示 */}
              {renderAComponet(q, i, userAnswer, modelAnswer)}
              {/* 解説 */}
              <h4 class="explanation">
                <span>解説:{q.explanation}</span>
              </h4>
              <br />
            </div>
          );
        })}
      </div>
      {/* フォローアップ問題作成用ボタン */}
      {score < questions.length && (
        <div class="followUp">
          <button class="followUpButton" onClick={handleFolowUp}>
            フォローアップ問題を作成する
          </button>
        </div>
      )}
      {/* フォローアップ作成中の表示 */}
      {isMakeFollowUp && (
        <div class="followUpBackGround">
          {getFollowUp ? (
            // フォローアップの作成が完了した時
            <div class="followUpMade">
              <h2 class="confirmFollowUpPupup">
                <span>フォローアップ問題の作成が完了しました</span>
              </h2>
              <button
                onClick={handleToFollowUp}
                class="followUpNavigateButton"
              >
                <span>フォローアップ問題を解く</span>
              </button>
            </div>
          ) : (
            // フォローアップの作成が終わってないとき
            <div class="followUpMaking">
              <div class="loader"></div>
              <span class="message_1">問題を生成中</span>
              <LoadingDot />
              <br />
              <span class="message_2">もう少しお待ちください</span>
            </div>
          )}
        </div>
      )}
      {/* ページを戻るボタン */}
      {backPage()}
    </div>
  );
}
export default Answer;
