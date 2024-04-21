<template>

  <q-toolbar class="text-primary">
    <div class="row fit">
      <div class="col-xs-12 col-md-9">
        <q-toolbar-title>
          <div class="row justify-start items-baseline">
            <div class="col-1">
              {{ drawerLabel() }}
            </div>
          </div>
        </q-toolbar-title>
      </div>
      <div class="col-xs-12 col-md-3 q-ma-none q-mt-sm text-right">

        <q-icon
          v-if="!route.path.startsWith('/sidepanel/')"
          class="cursor-pointer" size="2em"
          name="chevron_right" @click="closeRightDrawer()">
          <q-tooltip class="tooltip">Hide this view</q-tooltip>
        </q-icon>

        <div class="row" v-if="tab === DrawerTabs.OPEN_TABS">
          <div class="col">
            <span class="text-caption ellipsis">{{ filter }}</span>
            <q-btn
              flat dense icon="o_filter_list"
              :color="filter ? 'secondary' : 'primary'"
              size="0.8em"
              class="q-ml-md q-mr-none">
              <q-tooltip v-if="filter">Apply Filter: '{{ filter }}'</q-tooltip>
              <q-tooltip v-else>Apply Filter</q-tooltip>
            </q-btn>
            <q-popup-edit v-model="filter" v-slot="scope">
              <q-input
                autofocus
                dense
                maxlength="9"
                v-model="scope.value"
                :model-value="scope.value"
                @update:model-value="val => setFilter2( val)"
                hint="Filter open Tabs"
                @keyup.enter="scope.set">
                <template v-slot:after>
                  <q-btn
                    flat dense color="warning" icon="cancel" v-close-popup
                    @click="cancelFilter()"
                  />
                </template>
              </q-input>
            </q-popup-edit>
          </div>
        </div>

      </div>
    </div>
  </q-toolbar>

  <div class="row greyBorderTop"></div>

<!--  <UnassignedAndOpenTabs v-if="tab === DrawerTabs.UNASSIGNED_TABS"/>-->
  <BookmarksTree v-if="tab === DrawerTabs.BOOKMARKS"
    :nodes="showOnlyFolders ? useBookmarksStore().nonLeafNodes : useBookmarksStore().bookmarksNodes2"
    :show-only-folders="showOnlyFolders"
    @toggle-show-only-folders="toggleShowOnlyFolders()"
    :in-side-panel="true"/>


  <Features v-else-if="tab ===  DrawerTabs.FEATURES"/>

  <TabsetHelp v-else-if="tab ===  DrawerTabs.HELP"/>

  <div v-else>unknown tab name '{{ tab }}' {{ typeof tab }}</div>

</template>

<script lang="ts" setup>
import {ref, watchEffect} from "vue";
import {useRoute} from "vue-router";
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
import Features from "components/Features.vue";
import TabsetHelp from "components/TabsetHelp.vue";

const route = useRoute()

const tab = ref<DrawerTabs>(useUiStore().rightDrawer.activeTab)
const filter = ref<string>('')

const showOnlyFolders = ref(true)

const toggleShowOnlyFolders = () => {
  showOnlyFolders.value = !showOnlyFolders.value
}

watchEffect(() => tab.value = useUiStore().rightDrawer.activeTab)

const drawerLabel = () => {
  switch (tab.value) {
    case DrawerTabs.FEATURES:
      return "Additional Features"
    default:
      return tab.value
  }
}

const cancelFilter = () => {
  console.log("cancelFilter")
  filter.value = ''
}
const setFilter2 = (newVal: string) => {
  console.log("newVal2", newVal)
  filter.value = newVal
}
// const closeCurrentView = () => useUiService().closeCurrentView()
const closeRightDrawer = () => useUiStore().rightDrawerOpen = false

</script>


