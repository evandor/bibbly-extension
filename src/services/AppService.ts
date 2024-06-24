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
import {useUiStore} from "stores/uiStore";
import {useWindowsStore} from "src/windows/stores/windowsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useProjectsStore} from "src/projects/stores/projectsStore";
import {useSnapshotsService} from "src/snapshots/services/SnapshotsService";
import IndexedDbSnapshotPersistence from "src/snapshots/persistence/IndexedDbSnapshotPersistence";
import {useSnapshotsStore} from "src/snapshots/stores/SnapshotsStore";

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


    await ChromeListeners.initListeners()

    // ChromeBookmarkListeners.initListeners()

    settingsStore.initialize(quasar.localStorage);

    await useSnapshotsService().init(IndexedDbSnapshotPersistence)
    await useSnapshotsStore().initialize(IndexedDbSnapshotPersistence)

    // init db
    await IndexedDbPersistenceService.init("db")

    // init services
    useSuggestionsStore().init(useDB(undefined).db)

    await this.initCoreSerivces(quasar, useDB(undefined).db, this.router)

  }

  private async initCoreSerivces(quasar: any, store: PersistenceService, router: Router) {
    ChromeApi.init(router)

    if (usePermissionsStore().hasFeature(FeatureIdent.WINDOWS_MANAGEMENT)) {
      await useWindowsStore().initialize()
      useWindowsStore().initListeners()
    }

    await useProjectsStore().initialize()


    useUiStore().appLoading = undefined

    // if (useProjectsStore().projects.length > 0) {
    //   router.push("/sidepanel/projects")
    // }
  }

}

export default new AppService();

