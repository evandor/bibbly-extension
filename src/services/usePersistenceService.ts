import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import PersistenceService from "src/services/PersistenceService";
import FirestoreSpacesPersistence from "src/spaces/persistence/FirestoreSpacesPersistence";
import FirestoreTabsetsPersistence from "src/tabsets/persistence/FirestoreTabsetsPersistence";
import FirestoreSnapshotsPersistence from "src/snapshots/persistence/FirestoreSnapshotsPersistence";
import IndexedDbSpacesPersistence from "src/spaces/persistence/IndexedDbSpacesPersistence";
import IndexedDbTabsetsPersistence from "src/tabsets/persistence/IndexedDbTabsetsPersistence";
import IndexedDbSnapshotPersistence from "src/snapshots/persistence/IndexedDbSnapshotPersistence";
import {useSettingsStore} from "stores/settingsStore";

export function useDB() {

  const db: PersistenceService = IndexedDbPersistenceService

  const localMode = useSettingsStore().isEnabled('localMode')

  //console.log(`using localMode=${localMode} in persistenceService`)

  const spacesDb = localMode ? IndexedDbSpacesPersistence : FirestoreSpacesPersistence
  const tabsetsDb = localMode ? IndexedDbTabsetsPersistence : FirestoreTabsetsPersistence
  const snapshotsDb = localMode ? IndexedDbSnapshotPersistence : FirestoreSnapshotsPersistence

  return {
    db,
    spacesDb,
    tabsetsDb,
    snapshotsDb
  }

}
