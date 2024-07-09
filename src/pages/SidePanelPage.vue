<template>

  <q-page class="darkInDarkMode brightInBrightMode" style="padding-top: 34px">

    <!-- search -->
    <div class="row q-ma-md q-pa-md">
      <div class="col-12">
        <q-input rounded standout dense v-model="search" label="Search" bg-color="white">
          <template v-slot:prepend>
            <q-icon name="search"/>
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="search = ''" class="cursor-pointer"/>
          </template>
        </q-input>
      </div>
    </div>

    <!--    <div class="wrap" v-if="useUiStore().appLoading">-->
    <!--      <div class="loading">-->
    <!--        <div class="bounceball q-mr-lg"></div>-->
    <!--        <div class="text">{{ useUiStore().appLoading }}</div>-->
    <!--      </div>-->
    <!--    </div>-->

    <!-- white main box -->
    <div class="column fitpage q-pa-sm q-mx-sm q-mt-md bg-white">
      <div class="col" style="max-width:100%">

        <template v-if="view === 'projects'">
          <div class="row q-ma-md q-pa-md items-start">
            <div class="col-12">
              <q-select filled v-model="project" :options="projectOptions" label="Project"
                        style="border: 2px solid #21B6A8"
                        @update:modelValue="a => projectListWasClicked(a)"
              />
            </div>
            <div class="col-12 q-my-lg text-center">
              <q-btn unelevated rounded class="q-mx-md q-px-lg" color="primary" label="+ add current webpage"
                     @click="addCurrentTab()"
              />
            </div>
            <div class="col-12">

<!--              <q-list class="q-ma-none">-->
<!--                <q-item v-for="s in currentProject?.sources as Source[] || []"-->
<!--                        clickable-->
<!--                        v-ripple-->
<!--                        class="q-ma-none q-px-sm q-pt-xs q-pb-none q-ml-sm"-->
<!--                        :key="'source_' + s.id">-->

<!--                  <SourceWidget :source="s" :project="currentProject!"/>-->

<!--                </q-item>-->
<!--              </q-list>-->



            </div>
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
        <SidePanelPageTabList v-if="currentProject"
          :indent="calcFolders(currentProject as Tabset)?.length > 0"
          :tabsCount="useTabsetService().tabsToShow(currentProject as Tabset).length"
          :tabset="tabsetForTabList(currentProject as Tabset)"/>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Bibbly">
      </FirstToolbarHelper>
    </q-page-sticky>
  </q-page>

</template>

<script lang="ts" setup>

import {onMounted, onUnmounted, ref, watchEffect} from "vue";
import {useUtils} from "src/core/services/Utils";
import {LocalStorage, uid} from "quasar";
import {useUiStore} from "src/ui/stores/uiStore";
import {usePermissionsStore} from "src/stores/permissionsStore";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import Analytics from "src/core/utils/google-analytics";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {TITLE_IDENT} from "boot/constants";
import AppService from "src/services/AppService";
import {useI18n} from 'vue-i18n'
import {Tabset, TabsetStatus} from "src/tabsets/models/Tabset";
import _ from "lodash"
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {useSpacesStore} from "src/spaces/stores/spacesStore";
import {SelectTabsetCommand} from "src/tabsets/commands/SelectTabset";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {AddTabToTabsetCommand} from "src/tabsets/commands/AddTabToTabsetCommand";
import {Tab} from "src/tabsets/models/Tab";
import {useTabsetService} from "src/tabsets/services/TabsetService2";
import SidePanelPageTabList from "components/layouts/SidePanelPageTabList.vue";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useAuthStore} from "stores/authStore";
import ProjectForm from "src/projects/forms/ProjectForm.vue";
import {CreateProjectCommand} from "src/projects/commands/CreateProjectCommand";
import {CreateTabsetCommand} from "src/tabsets/commands/CreateTabset";

const {t} = useI18n({locale: navigator.language, useScope: "global"})

const {inBexMode} = useUtils()

const uiStore = useUiStore()

const search = ref('')
const showSearchBox = ref(false)
const view = ref('projects')
const tabsets = ref<Tabset[]>([])

const projects = ref<Tabset[]>([])
const project = ref('')
const currentProject = ref<Tabset | undefined>(undefined)
const projectOptions = ref<object[]>([])

function updateOnlineStatus(e: any) {
  const {type} = e
  useUiStore().networkOnline = type === 'online'
}

onMounted(() => {
  window.addEventListener('keypress', checkKeystroke);

  window.addEventListener("offline", (e) => updateOnlineStatus(e));
  window.addEventListener("online", (e) => updateOnlineStatus(e));

  Analytics.firePageViewEvent('SidePanelPage', document.location.href)
})

onUnmounted(() => {
  window.removeEventListener('keypress', checkKeystroke);
})

watchEffect(async () => {
  projects.value = [...useTabsetsStore().tabsets.values()]
  projectOptions.value = []
  _.forEach(projects.value as Tabset[], (p: Tabset) => {
    projectOptions.value.push({label: p.name, value: p.id})
  })
  projectOptions.value = _.sortBy(projectOptions.value, "label")
  projectOptions.value.push({
    label: 'Create new Project', value: 'new_project'
  })
  if (useTabsetsStore().currentTabsetName) {
    project.value = useTabsetsStore().currentTabsetName!
    console.log("project.value", project.value)
    currentProject.value = useTabsetsStore().getCurrentTabset
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
      view.value = 'projects'
      currentProject.value = res.result
      project.value = res.result.name
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

const projectListWasClicked = async (a:any) => {
  // console.log("Hier", project.value)
  // console.log("Hier", a)

  if (a.value === "new_project") {
    view.value = 'new_project'
    return
  } else if (currentProject.value) {
    //useAppStore().setCurrentProject(currentProject.value.id)
  }

  useCommandExecutor().execute(new SelectTabsetCommand(a.value, useSpacesStore().space?.id))
    .then((res: ExecutionResult<Tabset | undefined>) => {
      if (res.result) {
        currentProject.value = res.result
      }
    })

  // if (project.value && project.value.value) {
  //   currentProject.value = await useProjectsStore().findProject(project.value.value)
  // }

}

const addCurrentTab = async () => {
  let queryOptions = {active: true, lastFocusedWindow: true};
  // if (!currentProject.value) {
  //   console.warn("current project not set")
  //   return
  // }
  try {
    let [currentTab] = await chrome.tabs.query(queryOptions);
    if (currentTab) {
      await useCommandExecutor().executeFromUi(new AddTabToTabsetCommand(new Tab(uid(), currentTab)))
      // currentProject.value.sources.push(Source.newFrom(currentTab))
      // await useProjectsStore().updateProject(currentProject.value as Project)
    }
  } catch (err:any) {
    console.warn(err)
  }
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
      usePermissionsStore().addActivateFeature(message.data.feature)
      if (message.data.feature === 'help') {
      } else if (message.data.feature === 'bookmarks') {
        usePermissionsStore().load()
          .then(() => {
            // useBookmarksStore().init()
            // useBookmarksStore().loadBookmarks()
          })
      }
    } else if (message.name === "text-selection") {
      console.log("message", message)
    } else if (message.name === "feature-deactivated") {
      usePermissionsStore().removeActivateFeature(message.data.feature)
    } else if (message.name === "tabsets-imported") {
      // TODO reload
    } else if (message.name === "tab-being-dragged") {
      useUiStore().draggingTab(message.data.tabId, null as unknown as any)
    } else if (message.name === "note-changed") {
      if (message.data.noteId) {
        console.log("updating note", message.data.noteId)
        //.then((res: TabAndTabsetId | undefined) => {
        // if (res) {
        //   const note = res.tab
        //   note.title = message.data.tab.title
        //   note.description = message.data.tab.description
        //   note.longDescription = message.data.tab.longDescription
        // }
        //    })
      } else {
        console.log("adding tab", message.data.tab)
      }
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
      useSuggestionsStore().loadSuggestionsFromDb()
    } else if (message.name === "reload-tabset") {
      console.log("reload-tabset message received")
    } else if (message.name === 'reload-application') {
      AppService.restart("restarted=true")
    } else {
      console.log("got unmatched message", message)
    }
    return true
  })
}

function checkKeystroke(e: KeyboardEvent) {
  if (useUiStore().ignoreKeypressListener()) {
    return
  }
  if (e.key === '/') {
    // TODO does not work properly yet
    //showSearchBox.value = true
    // e.preventDefault()
    // // @ts-ignore
    // searchBox.value.focus()
    // search.value = ''
  }
}

const toolbarTitle = (tabsets: Tabset[]) => {

  const title = LocalStorage.getItem(TITLE_IDENT) || ('My Tabsets' + stageIdentifier())
  return tabsets.length > 6 ? title + ' (' + tabsets.length.toString() + ')' : title
}

const stageIdentifier = () => process.env.TABSETS_STAGE !== 'PRD' ? ' (' + process.env.TABSETS_STAGE + ')' : ''

const showSwitchedToLocalInfo = () => useUiStore().showSwitchedToLocalInfo
const ackSwitchToLocal = () => useUiStore().showSwitchedToLocalInfo = false

</script>

<style lang="scss">

.fitpage {
  height: calc(100vh - 200px);
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

.welcome-tooltip-container {
  position: absolute;
  top: 30px;
  right: -50px;
  width: 140px;
  display: inline-block
}

.welcome-tooltip-container .tooltip {
  z-index: 10000;
  padding: 0 8px;
  background: white;
  color: #333;
  position: absolute;
  top: -17px;
  right: 0;
  border: 2px solid #FFBF46;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 3px 3px 3px #ddd;
  animation: welcome-tooltip-pulse 1s ease-in-out infinite alternate
}

.welcome-tooltip-container .tooltip p {
  margin: 15px 0;
  line-height: 1.5
}

.welcome-tooltip-container .tooltip * {
  vertical-align: middle
}

.welcome-tooltip-container .tooltip::after {
  content: " ";
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 12.5px 0 12.5px;
  border-color: #FFBF46 transparent transparent transparent;
  position: absolute;
  top: -10px;
  right: 35px;
  transform: rotate(180deg)
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
