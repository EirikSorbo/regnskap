import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Konfigurasjonen kommer fra .env.local lokalt og fra GitHub-secrets i bygget.
// Disse verdiene er ikke hemmeligheter: Firebase-nøkkelen identifiserer bare
// prosjektet. Det som faktisk beskytter dataene er sikkerhetsreglene.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

/** Firestore med varig lokal hurtigbuffer.
 *
 *  Appen brukes fra hjemskjermen på telefonen, ofte på spillesteder med elendig
 *  dekning. Uten dette viser den tomme lister uten nett, og en kvittering du
 *  registrerer offline overlever ikke at appen lukkes. Med varig buffer leses
 *  dataene fra disk, og skrivinger står i kø til nettet er tilbake.
 *
 *  Fanebehandleren trengs fordi bufferen ellers bare kan eies av én fane. */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
