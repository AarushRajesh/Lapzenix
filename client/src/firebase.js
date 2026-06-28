import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

export const auth = getAuth(app);
let analytics;
if (import.meta.env.VITE_FIREBASE_API_KEY) {
    try {
        analytics = getAnalytics(app);
    } catch(e) {
        console.error("Firebase analytics failed to initialize", e);
    }
}
export { logEvent, analytics };
