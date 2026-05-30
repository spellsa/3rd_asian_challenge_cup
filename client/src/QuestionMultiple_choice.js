// 選択問題(回答複数)用のコンポーネント
import React, { useState, useEffect } from "react";
import styles from "./QuestionMultiple_choice.css";
import { MdDelete } from "react-icons/md";

function QuestionMultiple_choice({ index, question, answer, onAnswer }) {
  // 選択肢の個数を代入
  const choiceCount = question.options.length;

  // answerを保存するstate(answerがない場合は選択肢の個数分ある配列(全てfalse)を保存)
  const [selected, setSelected] = useState(
    answer || Array(choiceCount).fill(false)
  );

  // answerが更新されたときにそれをstateに代入(親から変更されたとき用)
  useEffect(() => {
    if (answer) setSelected(answer);
  }, [answer]);

  // 入力が変更されたときの処理(question.jsのhandleAnswerに回答(配列)と問題番号を送信)
  const handleChange = (i) => {
    const updated = [...selected]; // selectedをコピーした配列updatedを作る
    updated[i] = !updated[i]; // 変更した番号のtruefalseを変更(チェックしてるかしてないか)
    setSelected(updated); // stateに状態を保存
    onAnswer(index, updated); // 親に通知
  };

  // 選択をリセットするときの処理
  const handleClear = () => {
    const cleared = Array(choiceCount).fill(false); // 選択肢の個数分ある配列(全てfalse)を作成
    setSelected(cleared); // stateに状態を保存(全てfalse)
    onAnswer(index, cleared); // 親に通知
  };

  return(
    <div class="MultipleChoice">
        <h3 class="MultipleChoiceQuestion">
            <div class="MultipleChoiceQuestionNumber">
                <span>問題{index + 1}</span>
                <button onClick={handleClear} class="ResetMultipleChoice"><MdDelete size={20}/></button>
            </div>
            <div class="MultipleChoiceQuestionText">
                <span>{question.question}</span>
            </div>
        </h3>
        <span class="formExplain">正しいものをすべて選んでください</span>
        <div class="MultipleChoiceForm">
            {question.options.map((option, i) =>(
                <label key={`multi-${index}-${i}`} class="MultipleChoiceCheckbox">
                    <input 
                    type="button"
                    value={option}
                    onClick={() => handleChange(i)}
                    class={selected[i]?"selectedButton":"notSelectedButton"}
                    />
                </label>
            ))}
        </div>
    </div>
  );
}

export default QuestionMultiple_choice;
