import {initializeApp, FirebaseApp} from 'firebase/app';
// import { initializeApp } from "src/assets/firebase/firebase-app.js";
// import 'src/assets/firebase/firebase-auth.js';
// import 'src/assets/firebase/firebase-firestore.js';
// import 'src/assets/firebase/firebase-storage.js';
// import 'src/assets/firebase/firebase-database.js';

import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage'
// import 'firebase/database'
import {getAuth, Auth} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  initializeFirestore
} from 'firebase/firestore';
// import { getDatabase, Database } from 'firebase/database'
import { getStorage, FirebaseStorage } from "firebase/storage";

class FirebaseServices {

  private firebaseApp: FirebaseApp = null as unknown as FirebaseApp
  private auth: Auth = null as unknown as Auth
  private firestore: Firestore = null as unknown as Firestore
  // private messaging: Messaging = null as unknown as Messaging
  private storage:any// FirebaseStorage = null as unknown as FirebaseStorage
  // private realtimeDb: Database = null as unknown as Database

  init() {
    console.log("initializing FirebaseServices", process.env.FIREBASE_DATABASE_URL)
    const options = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      appId: process.env.FIREBASE_APP_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      // databaseURL: process.env.FIREBASE_DATABASE_URL
    }
    this.firebaseApp = initializeApp(options)
    this.auth = getAuth(this.firebaseApp)

    // https://firebase.google.com/docs/firestore/manage-data/enable-offline#web-modular-api
    // initializeFirestore(this.firebaseApp, {
    //   localCache:
    //     persistentLocalCache({tabManager: persistentMultipleTabManager()})
    // })
    initializeFirestore(this.firebaseApp,{})
    this.firestore = getFirestore(this.firebaseApp)
    this.storage = getStorage(this.firebaseApp)
    // this.realtimeDb = getDatabase(this.firebaseApp);
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

  // getRealtimeDb(): Database {
  //   return this.realtimeDb
  // }

}

export default new FirebaseServices();
