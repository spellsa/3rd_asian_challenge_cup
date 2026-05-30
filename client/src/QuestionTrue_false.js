// 〇×問題用のコンポーネント
import React from "react";
import styles from "./QuestionTrue_false.css";
import { MdDelete } from "react-icons/md";

function QuestionTrue_false({ index, question, onAnswer, answer }) {
  // question.jsのhandleAnswerに問題番号と選択内容を送信
  const handleAnswer = (value) => {
    const result = value === "〇"; // 選択が〇の時はtrue, ×の時はfalse
    onAnswer(index, result); // 親に送信
  };

  // 選択をリセットする処理
  const handleClear = () =>{
    onAnswer(index, null); // 親に通知
  }

  return (
    <div class="TrueFalse">
      {/* 問題番号と問題を表示 */}
      <h3 class="TrueFalseQuestion">
        <div class="TrueFalseQuestionNumber">
          <span>問題{index + 1}</span>
          <button onClick={handleClear} class="ResetTrueFalse"><MdDelete size={20}/></button>
        </div>
        <div class="TrueFalseQuestionText">
          <span>{question.question}</span>
        </div>
      </h3>
      <div class="formExplain">正しいと思う方を選択してください</div>
      {/* 〇と✖のボタン */}
      <div class="TrueFalseButton">
        <button
          onClick={() => handleAnswer("〇")}
          class={answer === true ? "TrueFalseSelectedButton" : "trueButton"}
        >
          <span>〇</span>
        </button>
        <button
          onClick={() => handleAnswer("×")}
          class={answer === false ? "TrueFalseSelectedButton" : "falseButton"}
        >
          <span>×</span>
        </button>
      </div>
    </div>
  );
}

export default QuestionTrue_false;
