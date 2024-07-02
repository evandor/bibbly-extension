import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {QVueGlobals, useQuasar} from "quasar";
import {LocalStoragePersistenceService} from "src/services/storage/LocalStoragePersistenceService";
import PersistenceService from "src/services/PersistenceService";
import IndexedDbProjectsPersistence from "src/projects/persistence/IndexedDbProjectsPersistence";
import ProjectsPersistence from "src/projects/persistence/ProjectsPersistence";
import FirestoreTabsetsPersistence from "src/tabsets/persistence/FirestoreTabsetsPersistence";
import FirestoreSpacesPersistence from "src/spaces/persistence/FirestoreSpacesPersistence";
import FirestoreSnapshotsPersistence from "src/snapshots/persistence/FirestoreSnapshotsPersistence";
import IndexedDbSnapshotPersistence from "src/snapshots/persistence/IndexedDbSnapshotPersistence";

export function useDB(quasar: QVueGlobals | undefined = undefined) {

  const db: PersistenceService = IndexedDbPersistenceService
  var localDb = undefined as unknown as PersistenceService
  if (quasar) {
    localDb = new LocalStoragePersistenceService(quasar)
  }
  const projectsIndexedDB: ProjectsPersistence = IndexedDbProjectsPersistence

  const spacesDb = FirestoreSpacesPersistence
  const tabsetsDb = FirestoreTabsetsPersistence
  const snapshotsDb = IndexedDbSnapshotPersistence

  return {
    db, localDb,
    projectsIndexedDB,
    spacesDb,
    tabsetsDb,
    snapshotsDb
  }

}
