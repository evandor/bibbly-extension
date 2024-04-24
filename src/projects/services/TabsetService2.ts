import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import _ from "lodash";
import {uid} from "quasar";
import ChromeApi from "src/services/ChromeApi";
import {TabPredicate} from "src/domain/Types";
// @ts-ignore
import {v5 as uuidv5} from 'uuid';
import {useSettingsStore} from "src/stores/settingsStore"
import PersistenceService from "src/services/PersistenceService";
import JsUtils from "src/utils/JsUtils";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useUiStore} from "stores/uiStore";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {Suggestion, SuggestionState, SuggestionType} from "src/models/Suggestion";
import {Project, TabsetStatus, TabsetType} from "src/projects/models/Project";
import {useTabsStore} from "src/projects/stores/tabsStore";
import {Tab} from "src/projects/models/Tab";
import {TabInFolder} from "src/projects/models/TabInFolder";

let db: PersistenceService = null as unknown as PersistenceService

export function useTabsetService() {

  const init = async (providedDb: PersistenceService,
                      doNotInitSearchIndex: boolean = false) => {
    console.log(" ...initializing tabsetService2 as", providedDb.getServiceName())
    db = providedDb

    useTabsStore().clearTabsets()

    await db.loadTabsets()
    if (!doNotInitSearchIndex) {
      // useSearchStore().populateFromContent(db.getContents())
      // useSearchStore().populateFromTabsets()
    }

    // check TODO!
    const selectedTS = localStorage.getItem("selectedTabset")
    if (selectedTS) {
      console.debug("setting selected tabset from storage", selectedTS)
      useTabsStore().selectCurrentTabset(selectedTS)
    }

    //  ChromeApi.buildContextMenu("tabsetService2")

    useTabsStore().tabsets.forEach(ts => {
      if (ts.sharedId) {
        //console.log("subscribing to topic ", ts.sharedId)
        //MqttService.subscribe(ts.sharedId)
      }
    })
  }



  const getTabset = (tabsetId: string): Project | undefined => {
    const tabsStore = useTabsStore()
    return _.find([...tabsStore.tabsets.values()] as Project[], ts => ts.id === tabsetId)
  }

  const reloadTabset = async (tabsetId: string) => {
    return db.reloadTabset(tabsetId)
  }

  const getCurrentTabset = (): Project | undefined => {
    const tabsStore = useTabsStore()
    return tabsStore.tabsets.get(tabsStore.currentTabsetId) as Project
  }


  const selectTabset = (tabsetId: string | undefined): void => {
    console.debug("selecting tabset", tabsetId)
    const tabsStore = useTabsStore()
    resetSelectedTabs()
    tabsStore.currentTabsetId = tabsetId || null as unknown as string;
    ChromeApi.buildContextMenu("tabsetService 230")
    if (tabsetId) {
      localStorage.setItem("selectedTabset", tabsetId)
    } else {
      localStorage.removeItem("selectedTabset")
    }
  }

  const deleteTabset = (tabsetId: string): Promise<string> => {
    const tabset = getTabset(tabsetId)
    if (tabset) {
      const tabsStore = useTabsStore()
      _.forEach(tabsStore.getTabset(tabsetId)?.tabs, (t: Tab) => {
        console.debug(t, "removing thumbnails")
        removeThumbnailsFor(t?.url || '')
      })
      tabsStore.deleteTabset(tabsetId)
      db.deleteTabset(tabsetId)
      //this.db.delete('tabsets', tabsetId)
      const nextKey: string = tabsStore.tabsets.keys().next().value
      console.log("setting next key to", nextKey)
      selectTabset(nextKey)
      return Promise.resolve("ok")
    }
    return Promise.reject("could not get tabset for id")
  }

  const deleteTabsetDescription = (tabsetId: string): Promise<string> => {
    const tabset = getTabset(tabsetId)
    if (tabset) {
      tabset.page = undefined
      useTabsetService().saveTabset(tabset)
      return Promise.resolve("done")
    }
    return Promise.reject("could not get tabset for id")
  }

  const deleteTabsetFolder = (tabset: Project, folder: Project): Promise<string> => {
    removeFolder(tabset, folder.id)
    tabset.folderActive = undefined
    useTabsetService().saveTabset(tabset)
    return Promise.resolve("done")
  }

  const deleteFromTabset = (tabsetId: any, predicate: TabPredicate): Promise<number> => {
    console.log("deleting from tabset")
    const ts = useTabsStore().getTabset(tabsetId)
    if (ts) {
      const tabsCount = ts.tabs.length
      const tabsToKeep: Tab[] = _.filter(ts.tabs, (t: Tab) => !predicate(t))
      console.debug("found tabsToKeep", tabsToKeep)
      ts.tabs = tabsToKeep
      return saveTabset(ts)
        .then((res) => tabsCount - tabsToKeep.length)
    }
    return Promise.reject("did not find tabset for id " + tabsetId)

  }

  const rootTabsetFor = (ts: Project | undefined): Project | undefined => {
    if (!ts) {
      return undefined
    }
    if (ts.folderParent) {
      return rootTabsetFor(getTabset(ts.folderParent))
    }
    return ts
  }

  const saveTabset = async (tabset: Project): Promise<any> => {
    if (tabset.id) {
      tabset.updated = new Date().getTime()
      // seems necessary !?
      if (!tabset.type) {
        tabset.type = TabsetType.DEFAULT
      }
      const additionalInfo = _.map(tabset.tabs, t => t.monitor)
      const rootTabset = rootTabsetFor(tabset)
      console.debug(`saving (sub-)tabset '${tabset.name}' with ${tabset.tabs.length} tab(s) at id ${rootTabset?.id}`)
      if (rootTabset) {
        return db.saveTabset(rootTabset)
      }
    }
    return Promise.reject("tabset id not set")
  }

  const addToTabsetId = async (tsId: string, tab: Tab, useIndex: number | undefined = undefined): Promise<Project> => {
    const ts = getTabset(tsId)
    if (ts) {
      return addToTabset(ts, tab, useIndex)
    }
    return Promise.reject("no tabset for given id " + tsId)
  }


  const saveCurrentTabset = (): Promise<any> => {
    const tabsStore = useTabsStore()
    const currentTabset = tabsStore.getCurrentTabset
    if (currentTabset) {
      //console.log("saving current tabset", currentTabset)
      return saveTabset(currentTabset)
    }
    return Promise.reject("current tabset could not be found")
  }


  const tabsetsFor = (url: string): string[] => {
    const tabsets: string[] = []
    for (let ts of [...useTabsStore().tabsets.values()]) {
      if (ts.status === TabsetStatus.DEFAULT || ts.status === TabsetStatus.FAVORITE) {
        if (_.find(ts.tabs, t => t.url === url)) {
          tabsets.push(ts.id)
        }
      }
    }
    return tabsets;
  }

  const tabsetFor = (id: string): Project | undefined => {
    let tabset: Project | undefined = undefined
    for (let ts of [...useTabsStore().tabsets.values()]) {
      if (_.find(ts.tabs, t => t.id === id)) {
        tabset = ts as Project
      }
    }
    return tabset
  }

  /**
   * adds the (new) Tab 'tab' to the tabset given in 'ts' (- but does not persist to db).
   *
   * proceeds only if tab.url exists and the tab is not already contained in the tabset.
   *
   * @param ts
   * @param tab
   * @param useIndex
   */
  const addToTabset = async (ts: Project, tab: Tab, useIndex: number | undefined = undefined): Promise<Project> => {
    if (tab.url) {
      const indexInTabset = _.findIndex(ts.tabs, t => t.url === tab.url)
      if (indexInTabset >= 0 && !tab.image) {
        return Promise.reject("tab exists already")
      }

      // add tabset's name to tab's tags
      tab.tags.push(ts.name)
      try {
        tab.tags.push(new URL(tab.url).hostname.replace("www.", ""))
      } catch (err) {
      }

      if (useIndex !== undefined && useIndex >= 0) {
        ts.tabs.splice(useIndex, 0, tab)
      } else {
        ts.tabs.push(tab)
      }
      // return saveTabset(ts)
      //   .then(() => Promise.resolve(0)) // TODO
      return Promise.resolve(ts)
    }
    return Promise.reject("tab.url undefined")
  }


  const deleteTab = (tab: Tab, tabset: Project): Promise<Project> => {
    console.log("deleting tab", tab.id, tab.chromeTabId, tabset.id)
    const tabUrl = tab.url || ''
    if (tabsetsFor(tabUrl).length <= 1) {

    }
    useTabsStore().removeTab(tabset, tab.id)
    console.log("deletion: saving tabset", tabset)
    return saveTabset(tabset)
      .then(() => tabset)
  }

  const getIfAvailable = (metas: object, key: string): string | undefined => {
    let res = undefined
    _.forEach(Object.keys(metas), k => {
      const value = metas[k as keyof object] as string
      if (k.endsWith(key) && value && value.trim().length > 0) {
        //console.log("k>", k, value)
        res = value
      }
    })
    return res
  }

  const urlExistsInATabset = (url: string): boolean => {
    for (let ts of [...useTabsStore().tabsets.values()]) {
      if (_.find(ts.tabs, t => t.url === url)) {
        return true;
      }
    }
    return false;
  }
  const urlExistsInCurrentTabset = (url: string): boolean => {
    const currentTabset = getCurrentTabset()
    // console.log("testing exists in current tabset", currentTabset.id, url)
    if (currentTabset) {
      if (_.find(currentTabset.tabs, t => {
        return (t.matcher) ?
          JsUtils.match(t.matcher, url) :
          t.url === url
      })) {
        return true
      }
    }
    return false;
  }

  const tabsToShow = (tabset: Project): Tab[] => {
    if (tabset.type === TabsetType.DYNAMIC &&
      tabset.dynamicTabs && tabset.dynamicTabs.type === DynamicTabSourceType.TAG) {
      const results: Tab[] = []
      //console.log("checking", tabset.dynamicTabs)
      const tag = tabset.dynamicTabs?.config['tags' as keyof object][0]
      //console.log("using tag", tag)
      const tabsets: Project[] = [...useTabsStore().tabsets.values()] as Project[]
      _.forEach(tabsets, (tabset: Project) => {
        _.forEach(tabset.tabs, (tab: Tab) => {
          if (tab.tags?.indexOf(tag) >= 0) {
            results.push(tab)
          }
        })
      })
      //return _.orderBy(results, getOrder(), [orderDesc.value ? 'desc' : 'asc'])
      return results
    }
    let tabs: Tab[] = tabset.tabs


    // TODO order??
    const filter = useUiStore().tabsFilter
    if (!filter || filter.trim() === '') {
      return tabs
    }
    return _.filter(tabs, (t: Tab) => {
      return (t.url || '')?.indexOf(filter) >= 0 ||
        (t.title || '')?.indexOf(filter) >= 0 ||
        t.description?.indexOf(filter) >= 0
    })
  }

  const findFolder = (folders: Project[], folderId: string): Project | undefined => {
    for (const f of folders) {
      if (f.id === folderId) {
        //console.log("found active folder", f)
        return f
      }
    }
    for (const f of folders) {
      return findFolder(f.folders, folderId)
    }
    return undefined
  }

  const removeFolder = (root: Project, folderId: string): void => {
    root.folders = _.filter(root.folders, f => f.id !== folderId)
    for (const f of root.folders) {
      removeFolder(f, folderId)
    }
  }

  const findTabInFolder = (folders: Project[], tabId: string): TabInFolder | undefined => {
    for (const f of folders) {
      for (const t of f.tabs) {
        if (t.id === tabId) {
          return new TabInFolder(t, f)
        }
      }
    }
    for (const f of folders) {
      if (f.folders) {
        return findTabInFolder(f.folders, tabId)
      }
    }
    return undefined
  }


  return {
    init,
    deleteFromTabset,
    deleteTabset,
    getTabset,
    getCurrentTabset,
    selectTabset,
    saveTabset,
    saveCurrentTabset,
    addToTabsetId,
    addToTabset,
    tabsetsFor,
    deleteTab,
    urlExistsInATabset,
    urlExistsInCurrentTabset,
    reloadTabset,
    //handleAnnotationMessage,
    tabsToShow,
    deleteTabsetDescription,
    findFolder,
    findTabInFolder,
    deleteTabsetFolder
  }

}
