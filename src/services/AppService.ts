import {usePermissionsStore} from "stores/permissionsStore";
import ChromeListeners from "src/services/ChromeListeners";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useDB} from "src/services/usePersistenceService";
import {useSuggestionsStore} from "stores/suggestionsStore";
import ChromeApi from "src/services/ChromeApi";
import {useSettingsStore} from "stores/settingsStore";
import {Router} from "vue-router";
import {useAppStore} from "stores/appStore";
import PersistenceService from "src/services/PersistenceService";
import {useUiStore} from "src/ui/stores/uiStore";
import {useWindowsStore} from "src/windows/stores/windowsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useProjectsStore} from "src/projects/stores/projectsStore";
import {useSnapshotsService} from "src/snapshots/services/SnapshotsService";
import IndexedDbSnapshotPersistence from "src/snapshots/persistence/IndexedDbSnapshotPersistence";
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

class AppService {

  router: Router = null as unknown as Router
  initialized = false

  async init(quasar: any, router: Router, forceRestart = false) {

    console.log(`%cinitializing AppService: first start=${!this.initialized}, forceRestart=${forceRestart}, quasar set=${quasar !== undefined}, router set=${router !== undefined}`, forceRestart ? "font-weight:bold" : "")

    if (this.initialized && !forceRestart) {
      console.debug("stopping AppService initialization; already initialized and not forcing restart")
      return Promise.resolve()
    }

    if (this.initialized) {
      await ChromeListeners.resetListeners()
    }

    this.initialized = true

    const appStore = useAppStore()
    const settingsStore = useSettingsStore()
    const uiStore = useUiStore()

    this.router = router

    uiStore.appLoading = "loading projects..."

    appStore.init()

    // init of stores and some listeners
    await usePermissionsStore().initialize(useDB(quasar).localDb)

    await useProjectsStore().initialize(useDB().projectsIndexedDB) // no service here

    await ChromeListeners.initListeners()

    // ChromeBookmarkListeners.initListeners()

    settingsStore.initialize(quasar.localStorage);

    await useSnapshotsService().init()
    await useSnapshotsStore().initialize(IndexedDbSnapshotPersistence)

    // should be initialized before search submodule
    await useThumbnailsService().init(IndexedDbThumbnailsPersistence)
    await useContentService().init(IndexedDbContentPersistence)

    //await searchStore.init().catch((err) => console.error(err))

    // init db
    await IndexedDbPersistenceService.init("db")

    // init services
    useSuggestionsStore().init(useDB(undefined).db)

    tabsetService.setLocalStorage(localStorage)

    await this.initCoreSerivces(quasar, useDB(undefined).db, this.router)

  }

  private async initCoreSerivces(quasar: any, store: PersistenceService, router: Router) {

    if (usePermissionsStore().hasFeature(FeatureIdent.WINDOWS_MANAGEMENT)) {
      await useWindowsStore().initialize()
      useWindowsStore().initListeners()
    }

    await useSpacesStore().initialize(useDB().spacesIndexedDb)

    const tabsetsPersistence = useDB().tabsetsIndexedDb
    await useTabsetsStore().initialize(tabsetsPersistence)
    await useTabsetService().init(tabsetsPersistence, false)

    await useTabsStore2().initialize()



    //await useGroupsStore().initialize(useDB().groupsIndexedDb)

    const existingUrls = useTabsetsStore().getAllUrls()
    await useContentService().populateSearch(existingUrls)
    await useTabsetService().populateSearch()

    ChromeApi.init(router)

    useUiStore().appLoading = undefined

    // if (useProjectsStore().projects.length > 0) {
    //   router.push("/sidepanel/projects")
    // }
  }

}

export default new AppService();

