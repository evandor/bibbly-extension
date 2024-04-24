import {IDBPDatabase, openDB, deleteDB} from "idb";
import ProjectsPersistence from "src/projects/persistence/ProjectsPersistence";
import {Project} from "src/projects/models/Project";

class IndexedDbProjectsPersistence implements ProjectsPersistence {

  private STORE_IDENT = 'projects';

  private db: IDBPDatabase = null as unknown as IDBPDatabase

  getServiceName(): string {
    return "IndexedDbSpacesStorage";
  }

  async init() {
    console.log(" ...initializing spaces (IndexedDbSpacesStorage)" )
    this.db = await this.initDatabase()
    return Promise.resolve()
  }

  private async initDatabase(): Promise<IDBPDatabase> {
    console.debug(" about to initialize indexedDB")
    const ctx = this
    return await openDB("bibbly", 1, {
      // upgrading see https://stackoverflow.com/questions/50193906/create-index-on-already-existing-objectstore
      upgrade(db) {
        if (!db.objectStoreNames.contains(ctx.STORE_IDENT)) {
          console.log("creating db " + ctx.STORE_IDENT)
          db.createObjectStore(ctx.STORE_IDENT);
        }
      }
    });
  }

  compactDb(): Promise<any> {
    return Promise.resolve(undefined);
  }

  deleteProject(projectId: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  findProjectById(id: string): Promise<Project> {
    return Promise.reject("undefined");
  }

  getEntities(): Promise<[]> {
    return Promise.resolve([]);
  }

  saveProject(project: Project): void {
  }



}

export default new IndexedDbProjectsPersistence()
