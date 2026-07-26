import rawConfig from './firebase-applet-config.json';

export interface FirebaseConfig {
  projectId?: string;
  appId?: string;
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
  [key: string]: any;
}

/**
 * Securely loads Firebase configuration by injecting environment variables
 * (e.g. VITE_FIREBASE_API_KEY, FIREBASE_API_KEY, API_KEY) into the configuration object.
 * Resolves the "An API Key must be set" error by dynamically ensuring a valid API key
 * is passed to Firebase initialization.
 */
export const loadFirebaseConfig = (): FirebaseConfig => {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

  const apiKey =
    env.VITE_FIREBASE_API_KEY ||
    env.VITE_API_KEY ||
    procEnv.VITE_FIREBASE_API_KEY ||
    procEnv.FIREBASE_API_KEY ||
    procEnv.API_KEY ||
    rawConfig.apiKey ||
    '';

  const projectId =
    env.VITE_FIREBASE_PROJECT_ID ||
    procEnv.FIREBASE_PROJECT_ID ||
    rawConfig.projectId ||
    '';

  const appId =
    env.VITE_FIREBASE_APP_ID ||
    procEnv.FIREBASE_APP_ID ||
    rawConfig.appId ||
    '';

  const authDomain =
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    procEnv.FIREBASE_AUTH_DOMAIN ||
    rawConfig.authDomain ||
    '';

  const storageBucket =
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    procEnv.FIREBASE_STORAGE_BUCKET ||
    rawConfig.storageBucket ||
    '';

  const messagingSenderId =
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    procEnv.FIREBASE_MESSAGING_SENDER_ID ||
    rawConfig.messagingSenderId ||
    '';

  const firestoreDatabaseId =
    env.VITE_FIREBASE_DATABASE_ID ||
    procEnv.FIREBASE_DATABASE_ID ||
    (rawConfig as any).firestoreDatabaseId ||
    undefined;

  const config: FirebaseConfig = {
    ...rawConfig,
    apiKey,
    projectId,
    appId,
    authDomain,
    storageBucket,
    messagingSenderId,
    firestoreDatabaseId
  };

  if (!config.apiKey) {
    console.warn(
      "Firebase Configuration Warning: No API key found in environment variables or configuration file."
    );
  }

  return config;
};

export const firebaseConfig = loadFirebaseConfig();
