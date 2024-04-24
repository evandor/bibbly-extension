<template>

  <q-page class="darkInDarkMode brightInBrightMode" style="padding-top: 34px">

    <template v-if="view === 'projects'">
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

      <div class="row q-ma-md q-pa-md bg-white items-start"
           style="position: absolute;bottom:10px;top:110px;left:5px;right:5px;">
        <div class="col-12">
          <q-select filled v-model="project" :options="projectOptions" label="Project"
            style="border: 2px solid #21B6A8"
          />
        </div>
        <div class="col-12 q-my-lg">
          <q-btn class="q-mx-lg q-px-lg" outline rounded color="primary" label="add current webpage"/>
        </div>
      </div>
    </template>

    <template v-if="view === 'new_project'">
      <div class="row q-ma-md q-pa-md">
        <div class="col-12">

         <ProjectForm />

        </div>
      </div>

    </template>
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
import SidePanelTabsetsExpansionList from "src/projects/components/SidePanelTabsetsExpansionList.vue";
import ProjectForm from "src/projects/forms/ProjectForm.vue";

const showOnlyFolders = ref(true)

const project = ref('')
const search = ref('')
const view = ref('projects')

const projectOptions = [
  {
    label: 'Create new Project',
    value: 'new_project'
  },
  {
    label: 'Facebook',
    value: 'Facebook'
  }]

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelBookmarksPage', document.location.href);
})

watchEffect(() => {
  console.log("new Project", project.value)
  if (project.value.value === "new_project") {
    view.value = 'new_project'
  }
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

const toggleShowOnlyFolders = () => {
  showOnlyFolders.value = !showOnlyFolders.value
}

</script>
