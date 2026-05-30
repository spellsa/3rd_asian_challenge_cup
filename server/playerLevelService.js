import { db } from "./firebase/firebase.js";

// 調整係数
const K = 3;
const LEVEL_CAP = 100; // 増加経験値が頭打ちになるレベル

// 引数として指定されたレベルに到達するための総経験値を計算
export function totalXpForLevel(level) {
  if (level < 1) return 0;
  if (level <= LEVEL_CAP) {
    return (K * (level - 1) * level) / 2;
  }
  // レベルがLEVEL_CAPを超える場合は、頭打ちの経験値を返す
  const capXp = (K * (LEVEL_CAP - 1) * LEVEL_CAP) / 2;
  return capXp + (level - LEVEL_CAP) * (K * LEVEL_CAP);
}

// 次のレベルに到達するための必要経験値を計算
export function calculateXpToNextLevel(currentXp, currentLevel) {
  const nextLevel = currentLevel + 1;
  const totalXp = totalXpForLevel(nextLevel);
  console.log(
    `Current XP: ${currentXp}, Current Level: ${currentLevel}, Total XP for next level (${nextLevel}): ${totalXp}`
  );
  return totalXp - currentXp;
}

// ユーザーに経験値を付与しレベルアップ処理を行う
export async function grantExperience(userId, experience) {
  // データベースからユーザーのドキュメントを取得
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    // ユーザーが存在しない場合は新規作成
    await userRef.set({
      level: 1,
      experience: 0,
    });
  }

  if (!userDoc.data().experience || !userDoc.data().level) {
    // ユーザーのドキュメントにexperienceとlevelがない場合は初期値を設定
    await userRef.update({
      level: 1,
      experience: 0,
    });
  }

  const refreshedData = (await userRef.get()).data();
  // 現在の経験値とレベルを取得
  const oldExperience = refreshedData.experience || 0;
  const oldLevel = refreshedData.level || 1;

  const newXp = oldExperience + experience;
  let newLevel = oldLevel;

  // 新しいレベルまでレベルを上げる
  while (newXp >= totalXpForLevel(newLevel + 1)) {
    newLevel++;
  }

  // 次のレベルに到達するための必要経験値を計算
  const xpToNextLevel = calculateXpToNextLevel(newXp, newLevel);

  // ユーザーのドキュメントを更新
  await userRef.update({
    experience: newXp,
    level: newLevel,
  });

  return { newXp, newLevel, xpToNextLevel };
}

// ユーザーのレベルと経験値を取得する関数
export async function getUserLevel(userId) {
  // データベースからユーザーのドキュメントを取得
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    // ユーザーが存在しない場合は新規作成
    await userRef.set({
      level: 1,
      experience: 0,
    });
  }

  if (!userDoc.data().experience || !userDoc.data().level) {
    // ユーザーのドキュメントにexperienceとlevelがない場合は初期値を設定
    await userRef.update({
      level: 1,
      experience: 0,
    });
  }

  const refreshedData = (await userRef.get()).data();
  // 現在の経験値とレベルを取得
  const currentExperience = refreshedData.experience || 0;
  const currentLevel = refreshedData.level || 1;

  // 次のレベルに到達するための必要経験値を計算
  const xpToNextLevel = calculateXpToNextLevel(currentExperience, currentLevel);

  return { currentExperience, currentLevel, xpToNextLevel };
}
