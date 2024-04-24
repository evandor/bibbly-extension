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
              />
            </div>
            <div class="col-12 q-my-lg text-center">
              <q-btn unelevated rounded class="q-mx-md q-px-lg" color="primary" label="+ add current webpage"
                     @click="addCurrentTab()"
              />
            </div>
            <div class="col-12">
              {{ currentProject }}
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
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Bibbly">

        <template v-slot:iconsRight>
          <q-btn icon="more_vert" color="grey" dense class="q-mx-none" flat/>
          <q-btn icon="account_circle" dense size="lg" class="q-mx-none" flat/>
        </template>

      </FirstToolbarHelper>
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import {onMounted, ref, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import {usePermissionsStore} from "stores/permissionsStore";
import ProjectForm from "src/projects/forms/ProjectForm.vue";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {CreateProjectCommand} from "src/projects/commands/CreateProjectCommand";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useProjectsStore} from "src/projects/stores/projectsStore";
import {Project} from "src/projects/models/Project";
import _ from "lodash"
import {Source} from "src/projects/models/Source";
import {uid} from "quasar";

const projects = ref<Project[]>([])
const project = ref('')
const currentProject = ref<Project | undefined>(undefined)
const search = ref('')
const view = ref('projects')

const projectOptions = ref<object[]>([])

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelProjectsPage', document.location.href);
})

watchEffect(() => {
  projects.value = useProjectsStore().projects
  projectOptions.value = []
  _.forEach(projects.value as Project[], (p: Project) => {
    projectOptions.value.push({label: p.name, value: p.id})
  })
  projectOptions.value = _.sortBy(projectOptions.value, "label")
  projectOptions.value.push({
    label: 'Create new Project', value: 'new_project'
  })
})

watchEffect(async () => {
  console.log("new Project", project.value)
  if (project.value && project.value.value) {
    currentProject.value = await useProjectsStore().findProject(project.value.value)
  }
  // if (project.value.value === "new_project") {
  //   view.value = 'new_project'
  // }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(" <<< received message", message)
  // if (inIgnoredMessages(message)) {
  //   return true
  // }
  if (message.name === 'feature-activated') {
    usePermissionsStore().addActivateFeature(message.data.feature)
  } else if (message.name === 'feature-deactivated') {
    usePermissionsStore().removeActivateFeature(message.data.feature)
  }
})

const createProject = (e: object) =>
  useCommandExecutor().executeFromUi(new CreateProjectCommand(e.name, e.description))
    .then((res: ExecutionResult<any>) => {
      view.value = 'projects'
    })

const addCurrentTab = async () => {
  let queryOptions = {active: true, lastFocusedWindow: true};
  let [currentTab] = await chrome.tabs.query(queryOptions);
  if (currentTab && project.value) {
    console.log("currentTab", currentTab)
    project.value.sources.push(new Source(uid(), currentTab.title || '???', currentTab.url))
  }
}
</script>

<style scoped>
.fitpage {
  height: calc(100vh - 200px);
}
</style>
