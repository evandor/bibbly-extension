<template>

  <q-page class="darkInDarkMode brightInBrightMode" style="padding-top: 54px">

    <offline-info />

    <!-- white main box -->
    <div class="column fitpage q-pa-sm q-mx-sm q-mt-md bg-white">
      <div class="col">

        <template v-if="view === 'add-project'">
          <div class="row q-ma-md q-pa-md">
            <div class="col-12 text-black">
              <ProjectForm @project-created="e => createProject(e)" @skip="view = 'projects'"/>
            </div>
          </div>
        </template>

        <template v-else>


          <div class="row q-ma-md q-pa-md items-start text-primary">
            <div class="col-12">
              <div class="text-h6 text-black q-mb-lg">
                Thank you for choosing Bibbly - we appreciate it
              </div>

              <div class="text-body1 text-black q-mb-lg">
                Let's begin without further delay!
              </div>
              <div class="text-body1 text-black q-mb-lg">

                Create your first project so that you can start adding webpages to it! A project can be writing a book,
                your master thesis or just collecting ideas on recipes, interior design or shopping :-).
              </div>
              <div class="text-body1 text-black q-mb-lg">
                For more info check our FAQ at
                bibbly.me.
              </div>

            </div>
            <div class="col-12 q-my-lg text-center text-black">
              <q-btn unelevated rounded class="q-mx-md q-px-lg" color="primary" label="+ add project"
                     @click="addProject()"
              />

            </div>
            <div class="col-12">

            </div>
          </div>

        </template>

      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Bibbly" />
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import {onMounted, ref, watchEffect} from "vue";
import Analytics from "src/core/utils/google-analytics";
import {useRouter} from "vue-router";
import ProjectForm from "src/projects/forms/ProjectForm.vue";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useAppStore} from "stores/appStore";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {Tabset} from "src/tabsets/models/Tabset";
import {CreateTabsetCommand} from "src/tabsets/commands/CreateTabsetCommand";
import OfflineInfo from "src/core/components/helper/offlineInfo.vue";

const router = useRouter()

const tabsets = ref<Tabset[]>([])
const view = ref('welcome')

const projectOptions = ref<object[]>([])

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelProjectsPage', document.location.href);
})

watchEffect(() => {
  tabsets.value = [...useTabsetsStore().tabsets.values()]
  if (tabsets.value.length > 0) {
    router.push("/mainpanel")
  }
})

const addProject = () => {
  view.value = 'add-project'
}

const createProject = (e: object) =>
  useCommandExecutor().executeFromUi(new CreateTabsetCommand(e['name' as keyof object], []))
    .then((res: ExecutionResult<Tabset>) => {
      console.log("got res", res)
      useAppStore().setCurrentProject(res.result.id)
      useTabsetsStore().selectCurrentTabset(res.result.id)
      // router.push("/sidepanel/projects")
      router.push("/mainpanel")
    })

</script>

<style scoped>
.fitpage {
  height: calc(100vh - 200px);
}
</style>
