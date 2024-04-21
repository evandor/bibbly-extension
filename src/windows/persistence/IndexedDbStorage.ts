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
        return await openDB("windowsDB", 1, {
            // upgrading see https://stackoverflow.com/questions/50193906/create-index-on-already-existing-objectstore
            upgrade(db) {
                if (!db.objectStoreNames.contains('windows')) {
                    console.log("creating db windows")
                    db.createObjectStore('windows');
                }
            }
        });
    }

    async addWindow(window: Window): Promise<any> {
        console.debug("adding window", `id=${window.id}, index=${window.index}, #hostList=${window.hostList.length}`)
        const existingWindowForWindowId: Window | undefined = await this.db.get('windows', window.id)
        if (existingWindowForWindowId) {

            const mergedWindow = new Window(
                window.id,
                window.browserWindow,
                existingWindowForWindowId.title,
                existingWindowForWindowId.index,
                existingWindowForWindowId.open,
                window.hostList
            )
            console.debug(`merging windows to ${mergedWindow.toString()}`)
            this.db.put('windows', mergedWindow, window.id).catch((err) => console.error("error", err))
            return Promise.resolve("not added, updated hostList instead")

            // not bad, simply resolve
            //console.debug("key already exists")
            //return Promise.resolve("Key already exists")
        }
        //if (!window.title) {
        // try to find matching window
        const allWindows: Window[] = await this.db.getAll('windows') as Window[]
        console.debug(`adding ${window.toString()} to list [${_.join(_.map(allWindows, w => w.id), ',')}]`)
        for (const w of allWindows) {
            if (w.hostList) {
                console.log("comparing hostLists", window.hostList, w.hostList, typeof w.hostList)
                const intersection = new Set([...window.hostList].filter(x => (new Set(w.hostList).has(x))));
                console.log("intersection", intersection, intersection.size === window.hostList.length, intersection.size === w.hostList.length)
                if (intersection.size === window.hostList.length && intersection.size === w.hostList.length) {
                    // reuse existing
                    const useId = window.id
                    const oldId = w.id
                    window = w
                    window.id = useId
                    console.log("replacing old window " + oldId + " with " + window.toString())
                    await this.db.delete('windows', oldId)
                    break
                }
            }
        }
        //}
        try {
            await this.db.add('windows', window, window.id)
        }
            //.then((res) => console.log("got res", res))
        catch (err: any) {
            if (!err.toString().indexOf('Key already exists')) {
                console.log("error adding window", window, err)
            }
        }
    }

    // updateGroup(group: chrome.tabGroups.TabGroup): Promise<any> {
    //   console.log("updating group", group)
    //   return this.db.put('groups', group, group.title)
    // }

    getWindows(): Promise<Window[]> {
        return this.db.getAll('windows')
    }

    getWindow(windowId: number): Promise<Window | undefined> {
        //console.log("trying to get window with id", windowId)
        return this.db.get('windows', windowId)
    }

    async removeWindow(windowId: number): Promise<void> {
        console.log("removing window", windowId)
        return this.db.delete('windows', windowId)
    }

    async updateWindow(window: Window): Promise<void> {
        console.debug(`updating window id=${window.id}, title=${window.title}, index=${window.index}, #hostList=${window.hostList?.length}`)
        if (!window.id) {
            return Promise.reject("window.id not set")
        }
        const windowFromDb: Window = await this.db.get('windows', window.id)
        if (!windowFromDb) {
            return Promise.reject("could not find window for id " + window.id)
        }
        const asJson = JSON.parse(JSON.stringify(window))

        asJson['title'] = window.title
        asJson['index'] = window.index
        asJson['hostList'] = window.hostList ? Array.from(window.hostList) : []

        delete asJson['tabs']
        //console.debug("saving window json as ", asJson)
        await this.db.put('windows', asJson, window.id)
    }

    async upsertWindow(window: Window): Promise<void> {
        try {
            console.log(`about to change window:  id=${window.id}, title=${window.title}, index=${window.index}, open=${window.open}, #hostList=${window.hostList.length}`)
            const asJson = JSON.parse(JSON.stringify(window))
            delete asJson['tabs']
            await this.db.put('windows', asJson, window.id)
        } catch (err) {
            console.log("error renaming window", err)
        }
    }

}

export default new IndexedDbStorage()
