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

    <div>

      <q-btn
        @click.stop="saveHtml(source as Source)"
        flat round color="primary" size="11px" icon="image"
      >
        <q-tooltip>Save this tab as HTML</q-tooltip>
      </q-btn>

    </div>
    <!-- white main box -->
    <div class="column q-pa-sm q-mx-sm q-mt-md bg-white">
      <div class="col">

        <template>
          <div class="row q-ma-md q-pa-md items-start">
            <div class="col-12">
aaa
            </div>

            <div class="col-12">
bbb
              <!-- TODO :disabled="!isOpen(tab as Tab)" -->
              <q-btn
                @click.stop="saveHtml(source as Source)"
                flat round color="primary" size="11px" icon="image"
              >
                <q-tooltip>Save this tab as HTML</q-tooltip>
              </q-btn>


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
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {CreateProjectCommand} from "src/projects/commands/CreateProjectCommand";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useProjectsStore} from "src/projects/stores/projectsStore";
import {Project} from "src/projects/models/Project";
import _ from "lodash"
import {Source} from "src/projects/models/Source";
import {uid} from "quasar";
import {useRoute, useRouter} from "vue-router";
import {SaveHtmlCommand} from "src/snapshots/domain/SaveHtml";
import Command from "src/core/domain/Command";

const router = useRouter()
const route = useRoute()

const projects = ref<Project[]>([])
const sourceId = ref('')
const source = ref<Source | undefined>(undefined)
const currentProject = ref<Project | undefined>(undefined)
const search = ref('')
const view = ref('projects')

const projectOptions = ref<object[]>([])

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelSourcePage', document.location.href);
  sourceId.value = route.params.sourceId as string
  console.log("sourceId", sourceId.value)

  // TODO
  source.value = _.find(
    _.flatMap(
      [...useProjectsStore().projects] as Project[],
      (p: Project) => p.sources),
    (s: Source) => s.id === sourceId.value)

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
  if (projects.value.length === 0) {
    console.log("no projects, redirecting to welcome page")
    router.push("/sidepanel/welcome")
  }
})

// watchEffect(async () => {
//   console.log("new Project", project.value)
//   if (project.value && project.value.value) {
//     currentProject.value = await useProjectsStore().findProject(project.value.value)
//   }
//   if (project.value.value === "new_project") {
//     view.value = 'new_project'
//   }
// })

const saveHtml = (source: Source | undefined) => {
  if (source) {
    chrome.tabs.query({currentWindow: true})
      .then((tabs: chrome.tabs.Tab[]) => {
        if (tabs.length > 0) {
          const saveHtmlCommand: Command<any> = new SaveHtmlCommand(tabs[0], source.id, "saved by user")
          useCommandExecutor().execute(saveHtmlCommand)
        }
      })
  }
}

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(" <<< received message", message)
//   // if (inIgnoredMessages(message)) {
//   //   return true
//   // }
//   if (message.name === 'feature-activated') {
//     usePermissionsStore().addActivateFeature(message.data.feature)
//   } else if (message.name === 'feature-deactivated') {
//     usePermissionsStore().removeActivateFeature(message.data.feature)
//   }
// })


</script>

<style scoped>
.fitpage {
  height: calc(100vh - 200px);
}
</style>
