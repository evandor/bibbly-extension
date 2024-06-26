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
    console.log(` ...initializing ${this.getServiceName()}` )
    this.db = await this.initDatabase()
    return Promise.resolve()
  }

  private async initDatabase(): Promise<IDBPDatabase> {
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

  async findProjectById(id: string) {
    return await this.db.get(this.STORE_IDENT, id)
  }

  async getProjects(): Promise<Project[]> {
    return await this.db.getAll(this.STORE_IDENT)
  }

  saveProject(project: Project) {
    console.log("putting project", project)
    return this.db.put(this.STORE_IDENT, project, project.id)
  }

  deleteProject(projectId: string): Promise<void> {
    return Promise.resolve(undefined);
  }


}

export default new IndexedDbProjectsPersistence()
