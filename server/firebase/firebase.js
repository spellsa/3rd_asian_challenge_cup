import { application } from "express";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

import { readFile } from "fs/promises";
import "dotenv/config";

const serviceAccount = JSON.parse(await readFile(new URL("./serviceAccountKey.json", import.meta.url)));
console.log("Firebase service account:", serviceAccount);

//const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase
const admin = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});

export const db = getFirestore(admin);
export const storage = getStorage(admin);
export const auth = getAuth(admin);
