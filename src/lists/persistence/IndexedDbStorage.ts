import {IDBPDatabase, openDB, deleteDB} from "idb";
import _ from "lodash";
import {useUiStore} from "src/stores/uiStore";
import {Window} from "src/windows/models/Window";

class IndexedDbStorage {
    private db: IDBPDatabase = null as unknown as IDBPDatabase

    async init() {
        console.log(" ...initializing windows IndexedDbStorage database")
        this.db = await this.initDatabase()
        useUiStore().dbReady = true
    }

    async deleteDatabase(dbName: string) {
        useUiStore().dbReady = false
        console.warn(" ...deleting indexeddb database: not implemented", dbName)
    }

    private async initDatabase(): Promise<IDBPDatabase> {
        console.debug(" about to initialize indexedDB")
        return await openDB("linksDB", 1, {
            // upgrading see https://stackoverflow.com/questions/50193906/create-index-on-already-existing-objectstore
            upgrade(db) {
                if (!db.objectStoreNames.contains('links')) {
                    console.log("creating db link")
                    db.createObjectStore('links');
                }
            }
        });
    }



}

export default new IndexedDbStorage()
