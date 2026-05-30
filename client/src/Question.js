// react系のものをインポート
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// css，各種コンポーネントをインポート
import styles from "./Question.css";
import Menu from './Menu';
import QuestionTure_false from "./QuestionTrue_false";
import QuestionFill_in_the_blank from "./QuestionFill_in_the_blank";
import QuestionFree_text_input from "./QuestionFree_text_input";
import QuestionSingle_choice from "./QuestionSingle_choice";
import QuestionMultiple_choice from "./QuestionMultiple_choice";
import { IoMdSend } from "react-icons/io";

function Question() {
  // URLのidを取得
  const { id } = useParams();

  //jsonのquestionsの中身を保存するstate
  const [questions, setQuestions] = useState([]);

  // リダイレクト用のメソッドを取得
  const navigate = useNavigate();

  // 表示されたときとidが変わったときに実行する
  useEffect(() => {
    const fetchData = async () => {
      try {
        // idが代入されていないという例外の処理
        if (!id) {
          alert("idが見つかりません");
          throw new Error("idが存在していません");
        }

        // idから問題の書いてあるjsonを取得
        const response = await fetch(
          `http://localhost:5000/api/get-question-set-json?id=${id}`
        );

        // responseがなかったらエラーが発生する
        if (!response.ok) {
          throw new Error("ネットワーク応答が不正です");
        }

        // jsonのデータ全てを保存
        const questionsData = await response.json();
        console.log("取得データ:", questionsData);

        // questionsにjsonのquestionsの部分を保存
        setQuestions(questionsData.questions);
      } catch (error) {
        // エラーの表示
        console.error("エラーが発生:", error);
      }
    };

    fetchData(); // jsonの取得を実行
  }, [id]);

  // 問題の回答を保存するstateの配列を作成(個数は問題の数で全てnullで埋め尽くす)
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));

  // 回答をした時の問題の状態を更新
  const handleAnswer = (index, value) => {
    console.log("変更する問題：", index, "変更した内容:", value);
    //stateの変更(引数はアロー関数)
    setAnswers((prev) => {
      // prevは更新前の状態(answerの状態)
      const updated = [...prev]; // prevだと変更を検知できないので新しくupdated配列をつくってprevの中身をコピー
      updated[index] = value; // 変更された番号(index)の中身(value)をupdated配列の同じ番号に代入
      return updated; // updatedの変更内容をstateの変更で写す
    });
  };

  // 回答送信ボタンを押したときの処理
  const handleSubmit = () => {
    // navigate関数で /answer/:idに遷移 + 問題と回答のデータを遷移先に送信
    navigate(`/answer/${id}`, {
      state: {
        questions: questions, // 問題データ
        answers: answers, // ユーザーの回答データ
      },
    });
  };

  // 問題の種類を判断してそれぞれのコンポーネントを返すメソッド
  const renderQComponent = (question, i) => {
    switch (question.questionType) {
      case "true_false": // 〇✖問題
        return (
          <QuestionTure_false // 〇✖問題のコンポーネント
            index={i} // 問題番号
            question={question} // 問題の内容
            answer={answers[i]} // 現在の回答(回答してないならnull)
            onAnswer={handleAnswer} // 回答の変更を行う関数
          />
        );
      case "fill_in_the_blank": // 穴埋め問題
        return (
          <QuestionFill_in_the_blank
            index={i} // 問題番号
            question={question} // 問題の内容
            answer={answers[i]} // 現在の回答(回答してないならnull)
            onAnswer={handleAnswer} // 回答の変更を行う関数
          />
        );
      case "free_text_input": // 記述問題
        return (
          <QuestionFree_text_input
            index={i} // 問題番号
            question={question} // 問題の内容
            answer={answers[i]} // 現在の回答(回答してないならnull)
            onAnswer={handleAnswer} // 回答の変更を行う関数
          />
        );
      case "numeric_input": // 計算問題(中身は記述問題と同じ)
        return (
          <QuestionFree_text_input
            index={i} // 問題番号
            question={question} // 問題の内容
            answer={answers[i]} // 現在の回答(回答してないならnull)
            onAnswer={handleAnswer} // 回答の変更を行う関数
          />
        );
      case "single_choice": // 選択問題(1つ選択)
        return (
          <QuestionSingle_choice
            index={i} // 問題番号
            question={question} // 問題の内容
            answer={answers[i]} // 現在の回答(回答してないならnull)
            onAnswer={handleAnswer} // 回答の変更を行う関数
          />
        );
      case "multiple_choice": // 選択問題(複数選択)
        return (
          <QuestionMultiple_choice
            index={i} // 問題番号
            question={question} // 問題の内容
            answer={answers[i]} // 現在の回答(回答してないならnull)
            onAnswer={handleAnswer} // 回答の変更を行う関数
          />
        );
      default:
        return (
          <li key={i}>
            <span class="unknowQuestion">
              問題形式が不明
              <br />
              問題: {question.question}
            </span>
          </li>
        );
    }
  };

  return (
    <>
      {/* 各問題の表示 */}
      <ul>{questions.map((q, index) => renderQComponent(q, index))}</ul>

      {/* 回答送信ボタン */}
      <div class="submitAnswer">
        <button onClick={handleSubmit} class="submitButton">
          <IoMdSend size={20}/><span>送信</span>
        </button>
      </div>

      <Menu />
    </>
  );
}

export default Question;
