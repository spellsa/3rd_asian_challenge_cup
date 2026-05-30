import React, {useState, useEffect} from "react";

function LoadingDot(){
    //dotの個数を保存するstate
    const [dot, setDot] = useState(0);

    // 画面に表示された時にタイマーが動く(useEffect)
    useEffect(() =>{

        //setInterval(繰り返す動作, 実行間隔[ms]);
        const interval = setInterval( () =>{
            //stateの数値を変更(引数内は0→1→2→3→0と表示するラムダ式)
            setDot(prev => (prev + 1) % 4);
        }, 1000);

        // 画面から消えた時の処理
        return () => clearInterval(interval); // setIntervalで始めたタイマーを止める
    }, []);

    return(
        <span>
            {'.'.repeat(dot)}
        </span>
    );
}

export default LoadingDot;