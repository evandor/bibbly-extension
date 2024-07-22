import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import {getAuth, Auth} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from "firebase/storage";

class FirebaseServices {

  private firebaseApp: firebase.app.App = null as unknown as firebase.app.App
  private auth: Auth = null as unknown as Auth
  private firestore: Firestore = null as unknown as Firestore
  // private messaging: Messaging = null as unknown as Messaging
  private storage: FirebaseStorage = null as unknown as FirebaseStorage
  // private realtimeDb: Database = null as unknown as Database

  init() {

    console.log("initializing FirebaseServices")
    this.firebaseApp = firebase.initializeApp({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      appId: process.env.FIREBASE_APP_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
    })
    this.auth = getAuth(this.firebaseApp)

    // https://firebase.google.com/docs/firestore/manage-data/enable-offline#web-modular-api
    // initializeFirestore(this.firebaseApp, {
    //   localCache:
    //     persistentLocalCache({tabManager: persistentMultipleTabManager()})
    // })
    initializeFirestore(this.firebaseApp,{})
    this.firestore = getFirestore(this.firebaseApp)
    this.storage = getStorage(this.firebaseApp)
    console.log("initializing FirebaseServices -- done")
  }

  getAuth() {
    return this.auth
  }

  getFirestore(): Firestore {
    return this.firestore
  }

  getStorage(): FirebaseStorage {
    return this.storage
  }

}

export default new FirebaseServices();
