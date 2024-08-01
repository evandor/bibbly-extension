<template>
  <q-toolbar class="text-primary q-pa-none q-pl-sm q-pr-xs q-pb-none">
    <q-toolbar-title>
      <div class="row q-ma-none q-pa-none" style="height:60px">

        <div class="col-2">
          <img v-if="showIcon" class="q-mt-md" width="42px" height="42px" src="icons/favicon-96x96.png"/>
        </div>

        <div class="col-8 q-ma-none q-pa-noneq q-mt-md" v-if="props.showSearchBox">
          <q-input rounded standout dense v-model="search" label="Search" bg-color="white" class="q-ma-none q-pa-none">
            <template v-slot:prepend>
              <q-icon name="search"/>
            </template>
            <template v-slot:append>
              <q-icon name="close" @click="search = ''" class="cursor-pointer"/>
            </template>
          </q-input>
        </div>
        <div v-else class="col-8">&nbsp;</div>

        <div class="col text-right q-mr-xs q-mt-md" v-if="!useUiStore().appLoading">

          <slot name="iconsRight">

            <q-avatar size="42px" v-if="!useSettingsStore().isEnabled('localMode')">
              <img
                @click="useAuthStore().logout()"
                :src="useAuthStore().avatar">
            </q-avatar>
            <q-icon v-else name="sym_o_database"
                    size="md"
                    class="cursor-pointer" color="grey" @click="openSettingsPage()">
              <q-tooltip class="tooltip-small">You are using the local Persistence Mode</q-tooltip>
            </q-icon>

          </slot>
        </div>
      </div>
    </q-toolbar-title>
  </q-toolbar>
</template>

<script lang="ts" setup>

import {useRouter} from "vue-router";
import {ref, watchEffect} from "vue";
import {useUiStore} from "src/ui/stores/uiStore";
import {useQuasar} from "quasar";
import {useAuthStore} from "stores/authStore";
import {useSettingsStore} from "stores/settingsStore";
import NavigationService from "src/services/NavigationService";

const props = defineProps({
  title: {type: String, default: "My Tabsets"},
  forceTitle: {type: Boolean, default: false},
  showSearchBox: {type: Boolean, default: false},
  showIcon: {type: Boolean, default: true},
  searchTerm: {type: String, default: ''},
  searchHits: {type: Number, required: false}
})

const $q = useQuasar()
const router = useRouter()

const searching = ref(false)
const windowLocation = ref('')
const search = ref('')

const toggleSearch = () => {
  searching.value = !searching.value
  if (searching.value) {
    router.push("/sidepanel/search")
  } else {
    router.push("/sidepanel")
  }
}

windowLocation.value = window.location.href

watchEffect(() => {
  if (props.showSearchBox && !searching.value) {
    searching.value = true
  }
})

if ($q.platform.is.chrome && $q.platform.is.bex) {
  chrome.commands.onCommand.addListener((command) => {
    if (command === 'search') {
      console.debug(`got Command: ${command}`);
      toggleSearch()
    }
  })
}

const showSearchIcon = () => true

const showSyncInfo = () => false

const offsetTop = () => ($q.platform.is.capacitor || $q.platform.is.cordova) ? 'margin-top:160px;' : ''

const openSettingsPage = () => {
  const url = chrome.runtime.getURL("www/index.html#/mainpanel/settings?tab=featureToggles")
  NavigationService.openSingleTab(url)
}

</script>

<style scoped>

.v-enter-active,
.v-leave-active {
  transition: opacity 3.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>
