import {usePermissionsStore} from "stores/permissionsStore";
import ChromeListeners from "src/services/ChromeListeners";
import {useDB} from "src/services/usePersistenceService";
import {useSuggestionsStore} from "stores/suggestionsStore";
import ChromeApi from "src/services/ChromeApi";
import {useSettingsStore} from "stores/settingsStore";
import {Router} from "vue-router";
import {useAppStore} from "stores/appStore";
import {useUiStore} from "src/ui/stores/uiStore";
import {User} from "firebase/auth";
import {useWindowsStore} from "src/windows/stores/windowsStore";
import {useProjectsStore} from "src/projects/stores/projectsStore";
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

class AppService {

  router: Router = null as unknown as Router
  initialized = false

  async init(quasar: any, router: Router, forceRestart = false, user: User | undefined = undefined) {

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
    await useSnapshotsStore().initialize(useDB().snapshotsDb)

    // should be initialized before search submodule
    await useThumbnailsService().init(IndexedDbThumbnailsPersistence)
    await useContentService().init(IndexedDbContentPersistence)

    //await searchStore.init().catch((err) => console.error(err))

    // init db
    // await IndexedDbPersistenceService.init("db")

    // init services
    await useAuthStore().setUser(user)

    useSuggestionsStore().init(useDB(undefined).db)

    tabsetService.setLocalStorage(localStorage)

    //await this.initCoreSerivces(quasar, useDB(undefined).db, this.router)

    if (useAuthStore().isAuthenticated()) {

      // await useFeaturesStore().initialize(useDB(quasar).featuresLocalStorage)


      if (router.currentRoute.value.query.token === "failed") {
        console.log("failed login, falling back to indexedDB")
      }

      // console.debug(`%cchecking sync config: persistenceStore=${persistenceStore.getServiceName()}`, "font-weight:bold")

      // await FsPersistenceService.init()

      await this.initCoreSerivces(quasar,  this.router)
    } else {
      await this.initCoreSerivces(quasar,  this.router)
    }
  }

  private async initCoreSerivces(quasar: any,  router: Router) {

    if (usePermissionsStore().hasFeature(FeatureIdent.WINDOWS_MANAGEMENT)) {
      await useWindowsStore().initialize()
      useWindowsStore().initListeners()
    }

    await useSpacesStore().initialize(useDB().spacesDb)

    const tabsetsPersistence = useDB().tabsetsDb
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

