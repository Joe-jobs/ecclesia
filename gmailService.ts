import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfigLoader';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify'
];

const provider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain access token from Google sign in');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getCachedUser = (): User | null => {
  return cachedUser;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  cachedUser = null;
};

export interface GmailEmailPayload {
  to: string;
  subject: string;
  body: string;
}

export const sendGmailMessage = async (payload: GmailEmailPayload, accessToken: string) => {
  const { to, subject, body } = payload;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body.replace(/\n/g, '<br/>')
  ];
  const emailRaw = emailLines.join('\r\n');
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64EncodedEmail
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gmail API error: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchRecentSentMessages = async (accessToken: string) => {
  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=label:SENT&maxResults=10', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch (err) {
    console.error('Error fetching sent messages:', err);
    return [];
  }
};
