import React, { useState } from "react"; //useStateをインポート
import { Link } from "react-router-dom"; //Linkをインポート
import styles from "./Menu.css"; //Menu.cssをインポート

const Menu = () => {
  //Menuの処理を行う関数
  const [isMenu, setIsMenu] = useState(false); //Menuの表示非表示のbool
  const [notDisplay, setNotDisplay] = useState(true); // 最初に表示される不具合を起こさないようにするbool

  const handleIsMenu = () => {
    setNotDisplay(false); //初回表示を防ぐためのboolをfalseに
    setIsMenu(!isMenu); //表示非表示の変更する関数
  };
  return (
    <div class="sideBar">
      {/* ハンバーガーメニューのボタン(押したときにメニューの表示非表示を変更) */}
      <button
        class={isMenu ? "menuActive" : "notActive"}
        onClick={() => {
          handleIsMenu();
        }}
      >
        <span class="itemCross"></span>
      </button>

      {/* メニューの表示非表示の条件分岐(trueの時にサイドメニューの表示) */}
      {isMenu ? (
        <div class="sideMenu">
          <li>
            <Link to="/">トップ</Link>
          </li>
          <li>
            <Link to="/dashboard">ホーム</Link>
          </li>
                    <li>
            <Link to="/create">問題作成</Link>
          </li>
          <li>
            <Link to="/mypage">プロフィール</Link>
          </li>
        </div>
      ) : (
        <div>
          {/* &&を使った条件分岐で初回にメニューの背景がフェードアウトする動作が実行されないようにする */}
          {!notDisplay && <div class="hideMenu"></div>}
        </div>
      )}
    </div>
  );
};

export default Menu; //Menu関数をエクスポート
