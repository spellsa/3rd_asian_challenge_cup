// 選択問題(回答1つ)用のコンポーネント
import React, { useState, useEffect } from "react";
import styles from "./QuestionSingle_choice.css";
import { MdDelete } from "react-icons/md";

function QuesitonSingle_choice({ index, question, answer, onAnswer }) {
  // 回答を保存するstate(answer or 空文字)
  const [selected, setSelected] = useState(answer || "");

  // answerが更新されたときにそれをstateに代入(親から変更されたとき用)
  useEffect(() => {
    if (answer !== undefined) setSelected(answer);
  }, [answer]);

  const handleChange = (value) => {
    // console.log(`入力: ${value}`);
    setSelected(value); // stateに変更内容を保存
    onAnswer(index, value); // 親に通知
  };

  // 選択をリセットする
  const handleClear = () => {
    setSelected(""); // stateに空文字を保存
    onAnswer(index, ""); // 親に通知
  };

  return (
    <div class="SingleChoice">
      <h3 class="SingleChoiceQuestion">
        <div class="SingleChoiceQuestionNumber">
          <span>問題{index + 1}</span>
          <button onClick={handleClear} class="ResetSingleChoice"><MdDelete size={20}/></button>
        </div>
        <div class="SingleChoiceQuestionText">
          <span>{question.question}</span>
        </div>
      </h3>
      <span class="formExplain">正しいものを選んでください</span>
      <div class="SingleChoiceForm">
        {question.options.map((option, i) => (
          <>
          <label key={`option-${index}-${i}`} class="SingleChoiceCheckbox">
            <input
              type="button"
              name={`question-${index}`}
              value={option}
              checked={selected === option}
              onClick={() => handleChange(option)}
              class={selected === option ? "SelectedSingleChoice" : "notSelectedSingleCohice"}
            />
          </label>
        </>
        ))}
      </div>
    </div>
  );
}

export default QuesitonSingle_choice;
