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
import {LocalStorageFeaturesPersistence} from "src/features/persistence/LocalStorageFeaturesPersistence";
import FeaturesPersistence from "src/features/persistence/FeaturesPersistence";

export function useDB() {

  const db: PersistenceService = IndexedDbPersistenceService

  const localMode = useSettingsStore().isEnabled('localMode')

  //console.log(`using localMode=${localMode} in persistenceService`)

  const spacesDb = localMode ? IndexedDbSpacesPersistence : FirestoreSpacesPersistence
  const tabsetsDb = localMode ? IndexedDbTabsetsPersistence : FirestoreTabsetsPersistence
  const snapshotsDb = localMode ? IndexedDbSnapshotPersistence : FirestoreSnapshotsPersistence
  const notesDb = IndexedDbNotesPersistence
  // const featuresDb: FeaturesPersistence = LocalStorageFeaturesPersistence

  return {
    db,
    spacesDb,
    tabsetsDb,
    snapshotsDb,
    notesDb,
    // featuresDb
  }

}
