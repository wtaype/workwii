// Mock file to allow project to build while other pages are migrated to Supabase in later phases
export const db = {};
export const auth = {
  currentUser: null,
  onAuthStateChanged: () => () => {}
};

// App Mock
export const initializeApp = () => ({});

// App-Check Mocks
export const initializeAppCheck = () => ({});
export class ReCaptchaV3Provider {}

// Firestore Mocks
export const collection = () => ({});
export const query = () => ({});
export const where = () => ({});
export const getCountFromServer = async () => ({ data: () => ({ count: 0 }) });
export const orderBy = () => ({});
export const limit = () => ({});
export const startAfter = () => ({});
export const getDocs = async () => ({ docs: [], empty: true });
export const getDoc = async () => ({ exists: () => false, data: () => null });
export const doc = () => ({});
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const serverTimestamp = () => new Date().toISOString();
export const Timestamp = {
  now: () => ({ toMillis: () => Date.now(), toDate: () => new Date() }),
  fromDate: (d) => ({ toMillis: () => d.getTime(), toDate: () => d })
};
export const onSnapshot = () => () => {};
export const increment = () => 1;
export const getFirestore = () => ({});

// Auth Mocks
export const getAuth = () => auth;
export const updatePassword = async () => {};
export const signOut = async () => {};
