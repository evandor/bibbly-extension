import ChromeListeners from "src/services/ChromeListeners";
import {useDB} from "src/services/usePersistenceService";
import ChromeApi from "src/services/ChromeApi";
import {Router} from "vue-router";
import {useUiStore} from "src/ui/stores/uiStore";
import {User} from "firebase/auth";
import {useWindowsStore} from "src/windows/stores/windowsStore";
import {useSnapshotsService} from "src/snapshots/services/SnapshotsService";
import {useSnapshotsStore} from "src/snapshots/stores/SnapshotsStore";
import {useThumbnailsService} from "src/thumbnails/services/ThumbnailsService";
import IndexedDbThumbnailsPersistence from "src/thumbnails/persistence/IndexedDbThumbnailsPersistence";
import {useContentService} from "src/content/services/ContentService";
import IndexedDbContentPersistence from "src/content/persistence/IndexedDbContentPersistence";
import tabsetService from "src/tabsets/services/TabsetService";
import {useTabsetService} from "src/tabsets/services/TabsetService2";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {useTabsStore2} from "src/tabsets/stores/tabsStore2";
import {useSpacesStore} from "src/spaces/stores/spacesStore";
import {useAuthStore} from "stores/authStore";
import {FeatureIdent} from "src/models/FeatureIdent";
import {useFeaturesStore} from "src/features/stores/featuresStore";
import {useSuggestionsStore} from "src/suggestions/stores/suggestionsStore";
import {useNotesStore} from "src/notes/stores/NotesStore";
import {LocalStorageFeaturesPersistence} from "src/features/persistence/LocalStorageFeaturesPersistence";
import {useSearchStore} from "src/search/stores/searchStore";
import {toRef, watch} from "vue";
import {useEntityRegistryStore} from "src/core/stores/entityRegistryStore";
import _ from "lodash"
import {TabsetInfo} from "src/core/models/TabsetInfo";

class AppService {

  router: Router = null as unknown as Router
  initialized = false

  async init(quasar: any, router: Router, forceRestart = false, user: User | undefined = undefined) {

    console.log(`%cinitializing AppService: first start=${!this.initialized}, forceRestart=${forceRestart}, quasar set=${quasar !== undefined}, router set=${router !== undefined}`, "font-weight:bold")

    if (this.initialized && !forceRestart) {
      console.debug("stopping AppService initialization; already initialized and not forcing restart")
      return Promise.resolve()
    }

    if (this.initialized) {
      await ChromeListeners.resetListeners()
    }

    this.initialized = true

    await useAuthStore().setUser(user)

    const uiStore = useUiStore()
    const searchStore = useSearchStore()

    this.router = router

    uiStore.appLoading = "loading projects..."

    // appStore.init()

    // init of stores and some listeners
    //await usePermissionsStore().initialize(useDB(quasar).localDb)

    await ChromeListeners.initListeners()

    await useSnapshotsStore().initialize(useDB().snapshotsDb)
    await useSnapshotsService().init()
    console.debug('')

    // should be initialized before search submodule
    await useThumbnailsService().init(IndexedDbThumbnailsPersistence)
    console.debug('')

    // should be initialized before search submodule
    await useThumbnailsService().init(IndexedDbThumbnailsPersistence)
    await useContentService().init(IndexedDbContentPersistence)

    console.debug('')

    await searchStore.init().catch((err) => console.error(err))


    await useSuggestionsStore().init()
    console.debug('')

    tabsetService.setLocalStorage(localStorage)

    //await this.initCoreSerivces(quasar, useDB(undefined).db, this.router)

    await useFeaturesStore().initialize(new LocalStorageFeaturesPersistence(quasar))

    if (useAuthStore().isAuthenticated()) {

      if (router.currentRoute.value.query.token === "failed") {
        console.log("failed login, falling back to indexedDB")
      }

      // console.debug(`%cchecking sync config: persistenceStore=${persistenceStore.getServiceName()}`, "font-weight:bold")

      // await FsPersistenceService.init()

      await this.initCoreSerivces(this.router)
    } else {
      //await this.initCoreSerivces(quasar,  this.router)
    }
  }

  restart(path: string) {
    console.log("%crestarting tabsets", "font-weight:bold", window.location.href)
    const baseLocation = window.location.href.split("?")[0]
    console.log("%cbaseLocation", "font-weight:bold", baseLocation)
    console.log("%cwindow.location.href", "font-weight:bold", window.location.href)
    if (window.location.href.indexOf("?") < 0) {
      const tsIframe = window.parent.frames[0]
      //log("iframe", tsIframe)
      if (tsIframe) {
        const location = chrome.runtime.getURL("/www/index.html#" + path)
        console.debug("%cnew window.location.href", "font-weight:bold", location)
        tsIframe.location.href = location
        tsIframe.location.reload()
      }
    }
  }

  private async initCoreSerivces(router: Router) {

    console.log(`%cinitializing AppService: initCoreSerivces`, "font-weight:bold")

    if (useFeaturesStore().hasFeature(FeatureIdent.WINDOWS_MANAGEMENT)) {
      await useWindowsStore().initialize()
      useWindowsStore().initListeners()
    }

    const registryStore = useEntityRegistryStore()

    await useNotesStore().initialize(useDB().notesDb)
    console.debug('')

    await useSpacesStore().initialize(useDB().spacesDb)
    console.debug('')

    /**
     * Pattern: TODO
     * initialize store with optional registry watcher and persistence
     * run persistence init code in store init
     * no persistence for service!
     */

    const tabsetsStore = useTabsetsStore()
    watch(tabsetsStore.tabsets, (newTabsets:Map<string,any>) => {
      const tsInfo =_.map([...newTabsets.values()], (ts: any) => new TabsetInfo(ts.id, ts.name, ts.window, ts.tabs.length))
      registryStore.tabsetRegistry = tsInfo
    })
    await tabsetsStore.initialize(useDB().tabsetsDb)
    await useTabsetService().init(false)
    console.debug('')

    await useTabsStore2().initialize()
    console.debug('')

    //await useGroupsStore().initialize(useDB().groupsIndexedDb)

    const existingUrls = useTabsetsStore().getAllUrls()
    await useContentService().populateSearch(existingUrls)
    useTabsetService().populateSearch()
    console.debug('')

    ChromeApi.init(router)

    useUiStore().appLoading = undefined
    console.debug('')
  }

}

export default new AppService();

