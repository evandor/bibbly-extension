import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {QVueGlobals, useQuasar} from "quasar";
import {LocalStoragePersistenceService} from "src/services/storage/LocalStoragePersistenceService";
import PersistenceService from "src/services/PersistenceService";
import IndexedDbProjectsPersistence from "src/projects/persistence/IndexedDbProjectsPersistence";
import ProjectsPersistence from "src/projects/persistence/ProjectsPersistence";
import IndexedDbSpacesPersistence from "src/spaces/persistence/IndexedDbSpacesPersistence";
import IndexedDbTabsetsPersistence from "src/tabsets/persistence/IndexedDbTabsetsPersistence";

export function useDB(quasar: QVueGlobals | undefined = undefined) {

  const db: PersistenceService = IndexedDbPersistenceService
  var localDb = undefined as unknown as PersistenceService
  if (quasar) {
    localDb = new LocalStoragePersistenceService(quasar)
  }
  const projectsIndexedDB: ProjectsPersistence = IndexedDbProjectsPersistence
  const spacesIndexedDb = IndexedDbSpacesPersistence
  const tabsetsIndexedDb = IndexedDbTabsetsPersistence
  return {
    db, localDb,
    projectsIndexedDB,
    spacesIndexedDb,
    tabsetsIndexedDb
  }

}
