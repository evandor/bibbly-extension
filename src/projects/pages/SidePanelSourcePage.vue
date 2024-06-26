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

      <div class="row q-mx-sm q-mt-xs" v-for="(html,index) in htmls">
        <PngViewHelper :pngId="html.sourceId" :created="html.created"
                       :index="index" :tabId="source?.id || 'unknown'"
                       extension="html"/>
        <div class="row" v-for="a in html.annotations">
          <div class="col-9 ellipsis">
            {{a.text}}
          </div>
          <div class="col-3 ellipsis">
            <q-btn icon="visibility" class="q-ma-none" size="xs" @click="restoreAnnotation(a)"/>
            <q-btn icon="delete"  class="q-ma-none" size="xs" @click="deleteAnnotation(a, index)"/>
          </div>
        </div>
      </div>

    </div>
    <!-- white main box -->
    <div class="column q-pa-sm q-mx-sm q-mt-md bg-white">
      <div class="col">

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
import {useProjectsStore} from "src/projects/stores/projectsStore";
import {Project} from "src/projects/models/Project";
import _ from "lodash"
import {Source} from "src/projects/models/Source";
import {useRoute, useRouter} from "vue-router";
import {SaveHtmlCommand} from "src/snapshots/domain/SaveHtml";
import Command from "src/core/domain/Command";
import PngViewHelper from "pages/sidepanel/helper/PngViewHelper.vue";
import {useSnapshotsService} from "src/snapshots/services/SnapshotsService";
import {useSnapshotsStore} from "src/snapshots/stores/SnapshotsStore";
import {BlobType, BlobMetadata} from "src/snapshots/models/BlobMetadata";

const router = useRouter()
const route = useRoute()

const projects = ref<Project[]>([])
const sourceId = ref('')
const source = ref<Source | undefined>(undefined)
const search = ref('')
const htmls = ref<BlobMetadata[]>([])

const projectOptions = ref<object[]>([])

const updateBlobs = () => {
  console.log("updateBlobs", source.value)
  if (source.value?.id) {
    useSnapshotsService().getMetadataFor(source.value.id, BlobType.HTML)
      .then((md: BlobMetadata[]) => {
        console.log("got", md)
        htmls.value = md

      })
  }
}


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
  updateBlobs()
})

watchEffect(() => {
  if (useSnapshotsStore().lastUpdate) {
    console.log("updating!")
    updateBlobs()
  }
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

const saveHtml = (source: Source | undefined) => {
  if (source) {
    chrome.tabs.query({currentWindow: true})
      .then((tabs: chrome.tabs.Tab[]) => {
        const tabCandidates = _.filter(tabs, (t: chrome.tabs.Tab) => t?.url === source.url)
        if (tabCandidates.length > 0) {
          const saveHtmlCommand: Command<any> = new SaveHtmlCommand(tabCandidates[0], source.id, "saved by user")
          useCommandExecutor().execute(saveHtmlCommand)
          updateBlobs()
        }
      })
  }
}


</script>

<style scoped>
.fitpage {
  height: calc(100vh - 200px);
}
</style>
