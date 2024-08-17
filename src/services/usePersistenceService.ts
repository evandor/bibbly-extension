import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import PersistenceService from "src/services/PersistenceService";
import FirestoreSpacesPersistence from "src/spaces/persistence/FirestoreSpacesPersistence";
import FirestoreTabsetsPersistence from "src/tabsets/persistence/FirestoreTabsetsPersistence";
import FirestoreSnapshotsPersistence from "src/snapshots/persistence/FirestoreSnapshotsPersistence";
import IndexedDbSpacesPersistence from "src/spaces/persistence/IndexedDbSpacesPersistence";
import IndexedDbTabsetsPersistence from "src/tabsets/persistence/IndexedDbTabsetsPersistence";
import IndexedDbSnapshotPersistence from "src/snapshots/persistence/IndexedDbSnapshotPersistence";
import {useSettingsStore} from "stores/settingsStore";
import IndexedDbNotesPersistence from "src/notes/persistence/IndexedDbNotesPersistence";
import FirebaseServices from "src/services/firebase/FirebaseServices";
import FirestoreNotesPersistence from "src/notes/persistence/FirestoreNotesPersistence";
import IndexedDbThumbnailsPersistence from "src/thumbnails/persistence/IndexedDbThumbnailsPersistence";
import FirestoreThumbnailsPersistence from "src/thumbnails/persistence/FirestoreThumbnailsPersistence";

function determineTabsetsDb(localMode: boolean) {
  if (localMode) {
    return IndexedDbTabsetsPersistence
  }
  try {
    if (FirebaseServices.getAuth().currentUser?.isAnonymous) {
      return IndexedDbTabsetsPersistence
    }
  } catch (err) {
    console.warn("offline? could not determine current user...", err)
  }
  return FirestoreTabsetsPersistence
}

export function useDB() {

  const db: PersistenceService = IndexedDbPersistenceService

  const localMode = useSettingsStore().isEnabled('localMode')

  //console.log(`using localMode=${localMode} in persistenceService`)

  const spacesDb = localMode ? IndexedDbSpacesPersistence : FirestoreSpacesPersistence
  const tabsetsDb = determineTabsetsDb(localMode)
  const snapshotsDb = localMode ? IndexedDbSnapshotPersistence : FirestoreSnapshotsPersistence
  const notesDb = localMode ? IndexedDbNotesPersistence : FirestoreNotesPersistence
  const thumbnailsDb = localMode ? IndexedDbThumbnailsPersistence: FirestoreThumbnailsPersistence
  // const featuresDb: FeaturesPersistence = LocalStorageFeaturesPersistence

  return {
    db,
    spacesDb,
    tabsetsDb,
    snapshotsDb,
    notesDb,
    thumbnailsDb
    // featuresDb
  }

}
