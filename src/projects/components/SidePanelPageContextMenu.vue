<template>
  <q-menu :offset="[12, 8]">
    <q-list dense style="min-width: 180px">

<!--      <ContextMenuItem v-close-popup-->
<!--                       @was-clicked="openEditTabsetDialog(tabset)"-->
<!--                       icon="o_note"-->
<!--                       label="Edit Tabset"/>-->

      <ContextMenuItem v-close-popup
                       @was-clicked="emits('editHeaderDescription')"
                       icon="o_description"
                       label="Tabset Description..."/>



      <q-separator inset v-if="useTabsetsStore().tabsets.size > 1"/>


      <template v-if="tabset.tabs.length > 0 && inBexMode() && (
          (!tabset.window || tabset.window === 'current'))">
        <ContextMenuItem
          icon="open_in_new"
          label="Open all in...">

          <q-item-section side>
            <q-icon name="keyboard_arrow_right"/>
          </q-item-section>
<!--          <q-menu anchor="top end" self="top start">-->
<!--            <q-list>-->
<!--              <q-item v-if="usePermissionsStore().hasFeature(FeatureIdent.AUTO_TAB_SWITCHER)"-->
<!--                      dense clickable v-close-popup @click="startAutoSwitchingTab(tabset.id)">-->
<!--                <q-item-section>switching tab</q-item-section>-->
<!--              </q-item>-->
<!--              <q-item dense clickable v-close-popup @click="restoreInNewWindow(tabset.id)">-->
<!--                <q-item-section>new window</q-item-section>-->
<!--              </q-item>-->
<!--              <q-item dense clickable v-close-popup @click="restoreInGroup(tabset.id)">-->
<!--                <q-item-section>current window</q-item-section>-->
<!--              </q-item>-->
<!--            </q-list>-->
<!--          </q-menu>-->

        </ContextMenuItem>

      </template>

      <template v-if="tabset.tabs.length > 0 && inBexMode() &&
            tabset.window && tabset.window !== 'current'">
<!--        <ContextMenuItem v-close-popup-->
<!--                         @was-clicked="restoreInGroup(tabset.id, tabset.window)"-->
<!--                         icon="open_in_new"-->
<!--                         label="Open in window..."/>-->
      </template>

      <ContextMenuItem v-if="useTabsetsStore().tabsets.size > 1"
                       v-close-popup
                       @was-clicked="focus(tabset)"
                       icon="filter_center_focus"
                       color="accent"
                       label="Focus on tabset"/>

      <template v-if="tabset.status === TabsetStatus.DEFAULT && useTabsetsStore().tabsets.size > 1">
        <ContextMenuItem v-close-popup
                         @was-clicked="pin(tabset)"
                         icon="o_push_pin"
                         color="warning"
                         label="Pin"/>
      </template>
      <template v-else-if="tabset.status === TabsetStatus.FAVORITE">
        <ContextMenuItem v-close-popup
                         @was-clicked="unpin(tabset)"
                         icon="push_pin"
                         color="warning"
                         label="Unpin"/>

      </template>

<!--      <template v-if="usePermissionsStore().hasFeature(FeatureIdent.ARCHIVE_TABSET) &&-->
<!--        tabset.status === TabsetStatus.DEFAULT">-->
<!--        <ContextMenuItem-->
<!--          v-close-popup-->
<!--          @was-clicked="archiveTabset(tabset)"-->
<!--          icon="o_inventory_2"-->
<!--          color="warning"-->
<!--          label="Archive"/>-->
<!--      </template>-->

      <q-separator inset/>

<!--      <ContextMenuItem v-if="usePermissionsStore().hasFeature(FeatureIdent.TABSETS_SHARING) && (tabset.sharing === TabsetSharing.UNSHARED || !tabset.sharing)"-->
<!--                       v-close-popup-->
<!--                       @was-clicked="shareTabsetPubliclyDialog(tabset)"-->
<!--                       icon="ios_share"-->
<!--                       color="warning"-->
<!--                       label="Share as link..."/>-->

<!--      <ContextMenuItem v-if="tabset.sharing === TabsetSharing.PUBLIC_LINK_OUTDATED"-->
<!--                       v-close-popup-->
<!--                       @was-clicked="shareTabsetPubliclyDialog(tabset, true)"-->
<!--                       icon="ios_share"-->
<!--                       color="warning"-->
<!--                       label="Republish">-->
<!--        <q-tooltip class="tooltip-small">Tabset has changed, republish</q-tooltip>-->
<!--      </ContextMenuItem>-->

<!--      <ContextMenuItem-->
<!--        v-if="tabset.sharing === TabsetSharing.PUBLIC_LINK || tabset.sharing === TabsetSharing.PUBLIC_LINK_OUTDATED"-->
<!--        v-close-popup-->
<!--        @was-clicked="removePublicShare(tabset.id, tabset.sharedId)"-->
<!--        icon="ios_share"-->
<!--        color="warning"-->
<!--        label="Stop Sharing">-->
<!--        <q-tooltip class="tooltip-small">Delete Shared Link</q-tooltip>-->
<!--      </ContextMenuItem>-->

      <q-separator inset v-if="usePermissionsStore().hasFeature(FeatureIdent.TABSETS_SHARING)" />

<!--      <template v-if="useSettingsStore().isEnabled('dev')">-->
<!--        <ContextMenuItem v-close-popup-->
<!--                         @was-clicked="useSearchStore().reindexTabset(tabset.id)"-->
<!--                         icon="o_note"-->
<!--                         label="Re-Index Search (dev)"/>-->

<!--        <q-separator inset/>-->
<!--      </template>-->

    </q-list>
  </q-menu>

</template>

<script lang="ts" setup>

import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useSettingsStore} from "stores/settingsStore";
import NavigationService from "src/services/NavigationService";
import {LocalStorage, openURL, useQuasar} from "quasar";
import {useUtils} from "src/core/services/Utils";
import ContextMenuItem from "pages/sidepanel/helper/ContextMenuItem.vue";
import {PropType} from "vue";
import {useRouter} from "vue-router";
import {Tabset, TabsetStatus} from "src/tabsets/models/Tabset";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";

const {inBexMode} = useUtils()

const $q = useQuasar()
const router = useRouter()

const props = defineProps({
  tabset: {type: Object as PropType<Tabset>, required: true}
})

const emits = defineEmits(['editHeaderDescription'])

const publictabsetsPath = "https://public.tabsets.net/tabsets/"

// const startTabsetNote = (tabset: Tabset) => {
//   const url = chrome && chrome.runtime && chrome.runtime.getURL ?
//     chrome.runtime.getURL('www/index.html') + "#/mainpanel/notes/?tsId=" + tabset.id + "&edit=true" :
//     "#/mainpanel/notes/?tsId=" + tabset.id + "&edit=true"
//   NavigationService.openOrCreateTab([url])
// }

// const createSubfolder = (tabset: Project) => {
//   $q.dialog({
//     component: NewSubfolderDialog,
//     componentProps: {
//       tabsetId: tabset.id,
//       parentFolder: undefined
//     }
//   })
// }

// const openEditTabsetDialog = (tabset: Project) => {
//   $q.dialog({
//     component: EditTabsetDialog,
//     //TODO switch to tabset: tabset?
//     componentProps: {
//       tabsetId: tabset.id,
//       tabsetName: tabset.name,
//       tabsetColor: tabset.color,
//       window: tabset.window,
//       details: tabset.details || useUiStore().listDetailLevel,
//       fromPanel: true
//     }
//   })
// }


const focus = (tabset: Tabset) =>
  router.push("/sidepanel/tabsets/" + tabset.id)



// const shareTabsetPubliclyDialog = (tabset: Tabset, republish: boolean = false) => {
//   $q.dialog({
//     component: ShareTabsetPubliclyDialog,
//     componentProps: {
//       tabsetId: tabset.id,
//       sharedId: tabset.sharedId,
//       tabsetName: tabset.name,
//       republish: republish
//     }
//   })
// }

// const removeWindow = () => {
//   const ts = useTabsStore().getCurrentTabset
//   if (ts) {
//     ts.window = 'current'
//     useTabsetService().saveTabset(ts)
//   }
// }
//
// const openNewWindowDialog = () => {
//   $q.dialog({
//     component: NewWindowDialog,
//     componentProps: {
//       tabsetId: useTabsStore().currentTabsetId
//     }
//   })
// }

</script>
