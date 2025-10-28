import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

if (!admin.apps.length) {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath || !fs.existsSync(credPath)) {
    throw new Error("Falta GOOGLE_APPLICATION_CREDENTIALS o el archivo no existe");
  }
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const db = admin.firestore();
