import React, { useState } from "react"; //useStateをインポート
import styles from "./Dashboard.css";
import { IoTimerOutline } from "react-icons/io5";

const AppButton = ({recent, myQuiz}) => {
  //どのクイズの種類を表示するかの関数
  const [selected, setSelected] = useState("recent"); //表示するクイズの定数(初期値は「最近クイズ」)
  const handleRecent = () => setSelected("recent"); //定数を最近のクイズに変更
  const handleMy = () => setSelected("my"); //定数を自分のクイズに変更
  const handleFriend = () => setSelected("friend"); //定数をフレンドのクイズに変更
  console.log("recentValue", recent);
  console.log("myValue", myQuiz);
  return (
    <div class="robbyButtons">
      <button
        class={selected === "recent" ? "afterClick" : "recentButton"}
        onClick={handleRecent}
      >
        最近のクイズ
      </button>{" "}
      {/* 最近のクイズボタン */}
      <button
        class={selected === "my" ? "afterClick" : "myButton"}
        onClick={handleMy}
      >
        自分のクイズ
      </button>{" "}
      {/* 自分のクイズボタン */}
      {/* それぞれのクイズを表示する条件分岐(指定してないものになった場合はクイズが表示できないと出力) */}
      {selected === "recent" ? (
        <>
          <h2>最近のクイズ</h2>
          {recent.length === 0 && recent &&(
            <h3>クイズがありません</h3>
          )}
          
          {recent && recent.map((recent, i) => (
            <div class="quizLink">
              <a href={`question/${recent.id}`}>
                <h3>{recent.title}</h3>
              </a>
            </div>
          ))}
        </>
      ) : selected === "my" ? (
        <>
          <h2>自分のクイズ</h2>
          {myQuiz.length === 0 && myQuiz &&(
            <h3>クイズがありません</h3>
          )}
          {myQuiz && myQuiz.map((my, i) => (
            <div class="quizLink">
              <a href={`question/${my.questionSetId}`}>
                <span>{my.title}</span>
              </a>
            </div>
          ))}
        </>
      ) : (
        <p>クイズが表示できません</p>
      )}
    </div>
  );
};

export default AppButton; //AppButton関数をエクスポート
