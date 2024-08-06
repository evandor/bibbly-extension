<template>

  <q-page class="darkInDarkMode brightInBrightMode" style="padding-top: 60px">

    <offline-info/>

    <!-- white main box -->
    <div class="column fitpage q-pa-sm q-mx-sm q-mt-md bg-white">
      <div class="col" style="max-width:100%;">

        <template v-if="view === 'projects'">
          <div class="row q-ma-none q-pa-none items-start">
            <div class="col-6">
              <span v-if="projects.length > 1"
                    @click="navigate('/sidepanel/collections')" class="cursor-pointer">
                <q-icon name="o_swap_horiz" color="primary" class="q-mr-sm"/>Change Collection
              </span>
            </div>
            <div class="col-6 text-right">
              <span @click="view = 'new_project'" class="cursor-pointer">
                <q-icon name="o_add_circle" color="primary" class="q-mr-sm"/>New Collection
              </span>
            </div>
            <div class="col-12">
              <hr style="height:1px;border:none;background-color: #efefef;">
            </div>

            <div class="col-9 q-ml-md">
              <div class="text-caption">Collection</div>
              <div class="text-body2 text-bold">{{ project }} ({{ currentProject?.status }})</div>
            </div>
            <div class="col text-right vertical-middle q-mt-md">
              <q-icon name="more_vert" size="sm" class="cursor-pointer"/>
              <SidePanelPageContextMenu v-if="currentProject" :tabset="currentProject as Tabset"/>
            </div>

            <div class="col-12">
              <hr style="height:1px;border:none;background-color: #efefef;">
            </div>
          </div>

          <template v-for="n in notes">
            <div class="row">
              <div
                class="col-1 cursor-pointer"
                @click="openNote(n)">
                <q-icon name="description" class="q-ml-md" color="grey" size="12px"/>
              </div>
              <div
                class="col vertical-bottom q-ml-xs ellipsis text-caption cursor-pointer text-blue-10"
                @click="openNote(n)">
                {{ n.title }}
              </div>
            </div>
          </template>

          <div class="col-12" v-if="notes.length > 0">
            <hr style="height:1px;border:none;background-color: #efefef;">
          </div>

          <div class="col-12 q-my-lg text-center">
            <q-btn
              :disable="alreadyAdded()"
              unelevated rounded no-caps class="q-mx-md q-px-lg" color="primary" :label="t('add_link')"
              @click="addCurrentTab()"
            />
          </div>


        </template>

        <!-- Formular for new/edit project -->
        <template v-if="view === 'new_project'">
          <div class="row q-ma-md q-pa-md">
            <div class="col-12">
              <ProjectForm @project-created="e => createProject(e)" @skip="view = 'projects'"/>
            </div>
          </div>
        </template>


        <!-- list of tabs, assuming here we have at least one tabset -->
        <SidePanelPageTabList v-if="currentProject && view==='projects'"
                              :indent="calcFolders(currentProject as Tabset)?.length > 0"
                              :tabsCount="useTabsetService().tabsToShow(currentProject as Tabset)?.length"
                              :tabset="tabsetForTabList(currentProject as Tabset)"/>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Bibbly"/>
    </q-page-sticky>
  </q-page>

</template>

<script lang="ts" setup>

import {onMounted, onUnmounted, ref, watchEffect} from "vue";
import {useUtils} from "src/core/services/Utils";
import {uid} from "quasar";
import {useUiStore} from "src/ui/stores/uiStore";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import Analytics from "src/core/utils/google-analytics";
import AppService from "src/app/AppService";
import {useI18n} from 'vue-i18n'
import {Tabset, TabsetStatus} from "src/tabsets/models/Tabset";
import _ from "lodash"
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {AddTabToTabsetCommand} from "src/tabsets/commands/AddTabToTabsetCommand";
import {Tab} from "src/tabsets/models/Tab";
import {useTabsetService} from "src/tabsets/services/TabsetService2";
import SidePanelPageTabList from "components/layouts/SidePanelPageTabList.vue";
import {ExecutionFailureResult, ExecutionResult} from "src/core/domain/ExecutionResult";
import ProjectForm from "src/projects/forms/ProjectForm.vue";
import {CreateTabsetCommand} from "src/tabsets/commands/CreateTabset";
import {useFeaturesStore} from "src/features/stores/featuresStore";
import {useRouter} from "vue-router";
import OfflineInfo from "src/core/components/helper/offlineInfo.vue";
import {useTabsStore2} from "src/tabsets/stores/tabsStore2";
import SidePanelPageContextMenu from "pages/sidepanel/SidePanelPageContextMenu.vue";
import {Note} from "src/notes/models/Note";
import {useNotesStore} from "src/notes/stores/NotesStore";
import NavigationService from "src/services/NavigationService";

const {t} = useI18n({locale: navigator.language, useScope: "global"})

const {inBexMode} = useUtils()

const router = useRouter()

const uiStore = useUiStore()

const view = ref('projects')
const tabsets = ref<Tabset[]>([])

const projects = ref<Tabset[]>([])
const project = ref('')
const currentProject = ref<Tabset | undefined>(undefined)
const projectOptions = ref<object[]>([])
const notes = ref<Note[]>([])

function updateOnlineStatus(e: any) {
  const {type} = e
  useUiStore().networkOnline = type === 'online'
}

onMounted(() => {
  // window.addEventListener('keypress', checkKeystroke);

  window.addEventListener("offline", (e) => updateOnlineStatus(e));
  window.addEventListener("online", (e) => updateOnlineStatus(e));

  Analytics.firePageViewEvent('SidePanelPage', document.location.href)
})

onUnmounted(() => {
  // window.removeEventListener('keypress', checkKeystroke);
})

watchEffect(async () => {
  projects.value = [...useTabsetsStore().tabsets.values()]
  if (projects.value.length === 0) {
    router.push("/sidepanel/welcome")
  }
  projectOptions.value = []
  _.forEach(projects.value as Tabset[], (p: Tabset) => {
    projectOptions.value.push({label: p.name, value: p.id})
  })
  projectOptions.value = _.sortBy(projectOptions.value, "label")
  if (useTabsetsStore().currentTabsetName) {
    project.value = useTabsetsStore().currentTabsetName!
    currentProject.value = useTabsetsStore().getCurrentTabset
  }
  if (currentProject.value) {
    console.log("getting notes for ", currentProject.value.id)
    notes.value = await useNotesStore().getNotesFor(currentProject.value.id)
  }
})

//
// watchEffect(() => {
//   if (useUiStore().tabsFilter) {
//     console.log("filtering:::", useUiStore().tabsFilter)
//   }
// })
//
const createProject = (e: object) =>
  useCommandExecutor().executeFromUi(new CreateTabsetCommand(e['name' as keyof object], []))
    .then((res: ExecutionResult<any>) => {
      if (res instanceof ExecutionFailureResult) {
        console.log("res", res)
      } else {
        view.value = 'projects'
        currentProject.value = res.result
        project.value = res.result.name
      }
    })


const tabsetForTabList = (tabset: Tabset) => {
  if (tabset.folderActive) {
    const af = useTabsetService().findFolder(tabset.folders, tabset.folderActive)
    if (af) {
      return af
    }
  }
  return tabset
}

const calcFolders = (tabset: Tabset): Tabset[] => {
  //console.log("calcFolders", tabset)
  if (tabset.folderActive) {
    const af = useTabsetService().findFolder(tabset.folders, tabset.folderActive)
    if (af && af.folderParent) {
      return [new Tabset(af.folderParent, "..", [])].concat(af.folders)
    }
  }
  return tabset.folders
}


const getTabsetOrder =
  [
    function (o: Tabset) {
      return o.status === TabsetStatus.FAVORITE ? 0 : 1
    },
    function (o: Tabset) {
      return o.name?.toLowerCase()
    }
  ]

function determineTabsets() {
  return _.sortBy(
    _.filter([...useTabsetsStore().tabsets.values()] as Tabset[],
      (ts: Tabset) => ts.status !== TabsetStatus.DELETED
        && ts.status !== TabsetStatus.HIDDEN &&
        ts.status !== TabsetStatus.ARCHIVED),
    getTabsetOrder, ["asc"]);
}

watchEffect(() => {
  tabsets.value = determineTabsets()
})

const addCurrentTab = async () => {
  let queryOptions = {active: true, lastFocusedWindow: true};
  try {
    let [currentTab] = await chrome.tabs.query(queryOptions);
    if (currentTab) {
      await useCommandExecutor().executeFromUi(new AddTabToTabsetCommand(new Tab(uid(), currentTab)))
    }
  } catch (err: any) {
    console.warn(err)
  }
}

const alreadyAdded = (): boolean => {
  const currentChromeTabUrl = useTabsStore2().currentChromeTab?.url
  if (currentChromeTabUrl) {
    const currentTabset = useTabsetsStore().getCurrentTabset
    if (currentTabset) {
      return _.find(currentTabset.tabs, (t: Tab) => t.url === currentChromeTabUrl) !== undefined
    }
  }
  return false
}

function inIgnoredMessages(message: any) {
  return message.msg === "html2text" ||
    message.msg === "captureThumbnail" ||
    message.msg === "capture-annotation" ||
    message.name === "reload-spaces" ||
    // message.name === "window-updated" ||
    message.msg === "html2links"
}

if (inBexMode()) {
  // seems we need to define these listeners here to get the matching messages reliably
  // these messages are created by triggering events in the mainpanel
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(" <<< received message", message)
    if (inIgnoredMessages(message)) {
      return true
    }
    if (message.name === 'current-tabset-id-change') {
      if (message.ignore) {
        return true
      }
      const tsId = message.data.tabsetId
    } else if (message.name === 'feature-activated') {
      useFeaturesStore().activateFeature(message.data.feature)
    } else if (message.name === "text-selection") {
      console.log("message", message)
    } else if (message.name === "feature-deactivated") {
      useFeaturesStore().deactivateFeature(message.data.feature)
    } else if (message.name === "tabsets-imported") {
      // TODO reload
    } else if (message.name === "tab-being-dragged") {
      useUiStore().draggingTab(message.data.tabId, null as unknown as any)
    } else if (message.name === "note-changed") {
     useNotesStore().getNotesFor(currentProject.value!.id)
       .then((ns: Note[]) => notes.value = ns)
    } else if (message.name === "tab-added") {
      // hmm - getting this twice...
      console.log(" > got message '" + message.name + "'", message)
      //updateSelectedTabset(message.data.tabsetId, true)
    } else if (message.name === "tab-deleted") {
    } else if (message.name === "tabset-added") {
    } else if (message.name === "mark-tabset-deleted") {
    } else if (message.name === "tabset-renamed") {
    } else if (message.name === "progress-indicator") {
      if (message.percent) {
        uiStore.progress = message.percent
        // uiStore.progressLabel = message.label
      }
      if (message.status === "done") {
        uiStore.progress = undefined
        // uiStore.progressLabel = undefined
      }
      sendResponse("ui store progress set to " + uiStore.progress)
    } else if (message.name === "detail-level-changed") {
      console.log("setting list detail level to ", message.data.level)
      useUiStore().setListDetailLevel(message.data.level)
    } else if (message.name === "detail-level-perTabset-changed") {
      console.log("setting list detail perTabset level to ", message.data.level)
      useUiStore().showDetailsPerTabset = message.data.level
    } else if (message.name === "fullUrls-changed") {
      console.log("setting fullUrls to ", message.data.value)
      useUiStore().setShowFullUrls(message.data.value)
    } else if (message.name === "reload-suggestions") {
      console.log("reload-suggestions message received")
      // useSuggestionsStore().loadSuggestionsFromDb()
    } else if (message.name === "reload-tabset") {
      console.log("reload-tabset message received")
    } else if (message.name === 'restart-application') {
      AppService.restart("/")
    } else {
      console.log("got unmatched message", message)
    }
    return true
  })
}

const navigate = (path: string) => router.push(path)

const openNote = (note: Note) => {
  const url = chrome.runtime.getURL(`/www/index.html#/mainpanel/notes/${note.id}`)
  NavigationService.openOrCreateTab([url])
}

</script>

<style lang="scss">

.fitpage {
  height: calc(100vh - 130px);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.q-item__section--avatar {
  min-width: 46px !important;
  padding-right: 12px !important;
  margin-bottom: 14px;
}

$width: 25px;
$height: 25px;

$bounce_height: 30px;

body {
  position: relative;
  width: 100%;
  height: 100vh;
}

.wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wrap2 {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.text {
  //color: #000066;
  font-size: 24px;
  display: inline-block;
  margin-left: 5px;
}

.bounceball {
  position: relative;
  display: inline-block;
  height: 37px;
  width: $width;

  &:before {
    position: absolute;
    content: '';
    display: block;
    top: 0;
    width: $width;
    height: $height;
    border-radius: 50%;
    background-color: #fbae17;
    transform-origin: 50%;
    animation: bounce 500ms alternate infinite ease;
  }
}

@keyframes bounce {
  0% {
    top: $bounce_height;
    height: 5px;
    border-radius: 60px 60px 20px 20px;
    transform: scaleX(2);
  }
  35% {
    height: $height;
    border-radius: 50%;
    transform: scaleX(1);
  }
  100% {
    top: 0;
  }
}

</style>
