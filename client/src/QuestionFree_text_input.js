// 記述問題用コンポーネント
import React, { useState, useEffect } from "react";
import styles from "./QuestionFree_text_input.css";
import { MdDelete } from "react-icons/md";

function QuestionFree_text_input({ index, question, answer, onAnswer }) {
  // 回答を保存するstate(answer or 空文字)
  const [input, setInput] = useState(answer || "");

  // answerが更新されたときにそれをstateに代入(親から変更されたとき用)
  useEffect(() => {
    if (answer !== undefined) setInput(answer);
  }, [answer]);

  // 入力が変更されたときの処理(question.jsのhandleAnswerに回答と問題番号を送信)
  const handleChange = (e) => {
    const value = e.target.value; // valueに入力内容を代入
    setInput(value); // 回答のstateを変更
    onAnswer(index, value); // 親に通知
  };

  // 回答をリセットする処理
  const handleClear = () =>{
    const cleared = "";
    setInput(cleared);
    onAnswer(index, cleared);
  };

  return (
    <div class="FreeTextInput">
      <h3 class="FreeTextInputQuestion">
        <div class="FreeTextInputQuestionNumber">
          <span>問題{index + 1}</span>
          <button onClick={handleClear} class="ResetFreeTextInput"><MdDelete size={20}/></button>
        </div>
        <div class="FreeTextInputQuestionText">
          <span>{question.question}</span>
        </div>
      </h3>
      <div class="FreeTextInputForm">
        <div class="formExplain">正しい答えを入力してください</div>
        <span>
          回答:
          <input
            type="text"
            class="EnteringFreeTextInput"
            value={input}
            onChange={handleChange}
            placeholder="ここに回答を入力"
          />
        </span>
      </div>
    </div>
  );
}

export default QuestionFree_text_input;
