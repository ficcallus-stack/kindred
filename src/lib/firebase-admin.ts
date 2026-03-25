import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const apps = getApps();

if (apps.length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        project_id: projectId,
        client_email: clientEmail,
        private_key: privateKey,
      } as any),
    });
  } else {
    console.warn("Firebase Admin credentials partially missing — skipping initialization (likely mid-build)");
  }
}

export const adminAuth = getAuth();
