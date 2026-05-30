// 穴埋め問題用コンポーネント
import React, { useState, useEffect } from "react";
import styles from "./QuestionFill_in_the_blank.css";
import { MdDelete } from "react-icons/md";

function QuestionFill_in_the_blank({ index, question, answer, onAnswer }) {
  // questionのところから問題文が入ってるquestion(partsと改名)の配列と穴埋めの空欄数(blankCount)を取得
  const { question: parts, blankCount } = question;

  // 穴埋めの空欄数に合わせて、過去の回答があればそれを初期値として使い、なければ空文字をセットする配列のstate
  const [inputs, setInputs] = useState(
    Array(blankCount)
      .fill("")
      .map((_, i) => answer?.[i] || "")
  );

  // answerが更新されたときにそれをstateに代入(親から変更されたとき用)
  useEffect(() => {
    if (answer) setInputs(answer);
  }, [answer]);

  // 入力が変更されたときの処理(question.jsに問題番号と穴埋めの内容(配列)を送信)
  const handleChange = (i, value) => {
    console.log(`入力 ${i}: ${value}`);
    const updated = [...inputs]; // inputsの内容をコピーした配列をupdatedに代入
    updated[i] = value; // 配列に変更したところ(i)の内容(value)を代入
    setInputs(updated); // stateに変更内容を保存
    onAnswer(index, updated); // 親に送信(配列で)
  };

  // 回答をリセットする処理
  const handleClear = () =>{
    const cleared = Array(blankCount).fill(""); // 選択肢の個数分ある配列(全て空文字)を作成
    setInputs(cleared); // stateに状態を保存(全て空文字)
    onAnswer(index, cleared); // 親に通知
  };

  return (
    <div class="FillInTheBlank">
      <h3 class="FillInTheBlankQuestion">
        {/* mapで問題と回答欄を全て表示する */}
        <div>
          <span>問題{index + 1}</span>
          <button onClick={handleClear} class="ResetFillInTheBlank"><MdDelete size={20}/></button>
        </div>
        {parts.map((part, i) => (
          <React.Fragment key={`part-${index}-${i}`}>
            {/* 回答欄で区切った問題文の一部の表示(すべて表示して全文) */}
            {part}
            {/* iが穴埋めの空欄数より小さい時に回答欄を作る */}
            {i < blankCount && (
              <input
                type="text"
                class="FillInTheBlankInput"
                value={inputs[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder="ここに回答を入力"
              />
            )}
          </React.Fragment>
        ))}
        <div class="formExplain">正しい答えを入力してください</div>
      </h3>
    </div>
  );
}

export default QuestionFill_in_the_blank;
