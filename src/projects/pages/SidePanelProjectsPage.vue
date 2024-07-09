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

    <!-- white main box -->
    <div class="column fitpage q-pa-sm q-mx-sm q-mt-md bg-white">
      <div class="col">

        <template v-if="view === 'projects'">
          <div class="row q-ma-md q-pa-md items-start">
            <div class="col-12">
              <q-select filled v-model="project" :options="projectOptions" label="Project"
                        style="border: 2px solid #21B6A8"
                        @update:modelValue="a => projectListWasClicked(a)"
              />
            </div>
            <div class="col-12 q-my-lg text-center" v-if="currentProject">
              <q-btn unelevated rounded class="q-mx-md q-px-lg" color="primary" label="+ add current webpage"
                     @click="addCurrentTab()"
              />
            </div>
            <div class="col-12">

              <q-list class="q-ma-none">
                <q-item v-for="s in currentProject?.sources as Source[] || []"
                  clickable
                  v-ripple
                  class="q-ma-none q-px-sm q-pt-xs q-pb-none q-ml-sm"
                  :key="'source_' + s.id">

                  <SourceWidget :source="s" :project="currentProject!"/>

                </q-item>
              </q-list>



            </div>
          </div>

          <div>
<!--            <SidePanelPageTabList-->
<!--              :indent="calcFolders(tabset as Tabset)?.length > 0"-->
<!--              :tabsCount="useTabsetService().tabsToShow(tabset as Tabset).length"-->
<!--              :tabset="tabsetForTabList(tabset as Tabset)"/>-->
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
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Bibbly">

        <template v-slot:iconsRight>
          <q-btn icon="more_vert" color="blue" dense class="q-mx-none" flat  @click="location.reload()"/>
          <q-btn @click="useAuthStore().logout()"
                 icon="account_circle"
                 dense size="lg" class="q-mx-none" flat/>
        </template>

      </FirstToolbarHelper>
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import {onMounted, ref, watchEffect} from "vue";
import Analytics from "src/core/utils/google-analytics";
import {usePermissionsStore} from "stores/permissionsStore";
import ProjectForm from "src/projects/forms/ProjectForm.vue";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {CreateProjectCommand} from "src/projects/commands/CreateProjectCommand";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useProjectsStore} from "src/projects/stores/projectsStore";
import {Project} from "src/projects/models/Project";
import _ from "lodash"
import {Source} from "src/projects/models/Source";
import {uid} from "quasar";
import SourceWidget from "src/projects/widget/SourceWidget.vue";
import {useRouter} from "vue-router";
import {useAppStore} from "stores/appStore";
import SidePanelPageTabList from "components/layouts/SidePanelPageTabList.vue";
import {Tabset} from "src/tabsets/models/Tabset";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {useAuthStore} from "stores/authStore";

const router = useRouter()

const projects = ref<Tabset[]>([])
const project = ref('')
const currentProject = ref<Tabset | undefined>(undefined)
const search = ref('')
const view = ref('projects')

const projectOptions = ref<object[]>([])

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelProjectsPage', document.location.href);
  setTimeout(() => {
    if (projects.value.length === 0) {
      console.log("no projects, redirecting to welcome page")
      router.push("/sidepanel/welcome")
    }
  }, 1000)
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
})

watchEffect(() => {
  const currentProjectId = useTabsetsStore().currentTabsetId
  if (currentProjectId) {
    currentProject.value = useTabsetsStore().getCurrentTabset
  }
})

const projectListWasClicked = async (a:any) => {
  console.log("Hier", project.value, a)
  // if (project.value && project.value.value) {
  //   currentProject.value = await useProjectsStore().findProject(project.value.value)
  // }
  // if (project.value.value === "new_project") {
  //   view.value = 'new_project'
  // } else if (currentProject.value) {
  //   useAppStore().setCurrentProject(currentProject.value.id)
  // }
}

const createProject = (e: object) =>
  useCommandExecutor().executeFromUi(new CreateProjectCommand(e.name, e.description))
    .then((res: ExecutionResult<any>) => {
      view.value = 'projects'
      currentProject.value = res.result
      project.value = res.result.name
    })

const addCurrentTab = async () => {
  let queryOptions = {active: true, lastFocusedWindow: true};
  if (!currentProject.value) {
    console.warn("current project not set")
    return
  }
  try {
    let [currentTab] = await chrome.tabs.query(queryOptions);
    if (currentTab) {
      currentProject.value.sources.push(Source.newFrom(currentTab))
      await useProjectsStore().updateProject(currentProject.value as Project)
    }
  } catch (err:any) {
    currentProject.value.sources.push(new Source(uid(), err.toString(), 'https://example.com'))
    await useProjectsStore().updateProject(currentProject.value as Project)
  }
}
</script>

<style scoped>
.fitpage {
  height: calc(100vh - 200px);
}
</style>
