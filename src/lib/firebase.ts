import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Detect whether we have a live production Firebase setup or whether we should use localized persistence fallback
export const isLiveFirebase = firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'dummy-api-key' &&
  firebaseConfig.projectId !== 'dummy-project-id';

let app: any = null;
let db: any = null;
let auth: any = null;

if (isLiveFirebase) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    auth = getAuth(app);
  } catch (err) {
    console.error('Failed to initialize production Firebase, reverting tracking to local:', err);
  }
}

export { db, auth };
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In Utility via Pop-up matching instructions
export async function signInWithGoogle() {
  if (!isLiveFirebase || !auth) {
    throw new Error('Firebase Auth is not bridged yet. Check terms of service.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
}

export async function logOutUser() {
  if (!isLiveFirebase || !auth) return;
  await signOut(auth);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

// Mandated Error Handler from Skill.md
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to firestore on boot as mandated
export async function testConnection() {
  if (!isLiveFirebase || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified and online.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firestore client is offline. Local changes will sync when reconnected.");
    }
  }
}

testConnection();
