import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const apps = getApps();
let appInitialized = false;

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
    appInitialized = true;
  } else {
    console.warn("Firebase Admin credentials partially missing — skipping initialization (likely mid-build)");
  }
} else {
  appInitialized = true;
}

// Proxy-based lazy export to prevent build-time crashes
export const adminAuth = new Proxy({} as any, {
  get(_, prop) {
    if (!appInitialized) {
      if (typeof prop === 'string' && prop === 'toJSON') return () => ({}); // Support JSON serialization if needed
      throw new Error("Firebase Admin not initialized. Ensure environment variables are set.");
    }
    const auth = getAuth();
    return (auth as any)[prop];
  }
}) as ReturnType<typeof getAuth>;
