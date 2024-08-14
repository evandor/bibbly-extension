<template>
  <q-menu :offset="[12, 8]">
    <q-list dense style="min-width: 180px">

      <!--      <ContextMenuItem v-close-popup-->
      <!--                       @was-clicked="openEditTabsetDialog(tabset)"-->
      <!--                       icon="o_note"-->
      <!--                       label="Edit Tabset"/>-->

      <!--      <ContextMenuItem v-close-popup-->
      <!--                       @was-clicked="emits('editHeaderDescription')"-->
      <!--                       icon="o_description"-->
      <!--                       label="Tabset Description..."/>-->


      <!--      <q-separator inset v-if="useTabsetsStore().tabsets.size > 1"/>-->


      <!--      <template v-if="tabset.tabs.length > 0 && inBexMode() && (-->
      <!--          (!tabset.window || tabset.window === 'current'))">-->
      <!--        <ContextMenuItem-->
      <!--          icon="open_in_new"-->
      <!--          label="Open all in...">-->

      <!--          <q-item-section side>-->
      <!--            <q-icon name="keyboard_arrow_right"/>-->
      <!--          </q-item-section>-->
      <!--&lt;!&ndash;          <q-menu anchor="top end" self="top start">&ndash;&gt;-->
      <!--&lt;!&ndash;            <q-list>&ndash;&gt;-->
      <!--&lt;!&ndash;              <q-item v-if="usePermissionsStore().hasFeature(FeatureIdent.AUTO_TAB_SWITCHER)"&ndash;&gt;-->
      <!--&lt;!&ndash;                      dense clickable v-close-popup @click="startAutoSwitchingTab(tabset.id)">&ndash;&gt;-->
      <!--&lt;!&ndash;                <q-item-section>switching tab</q-item-section>&ndash;&gt;-->
      <!--&lt;!&ndash;              </q-item>&ndash;&gt;-->
      <!--&lt;!&ndash;              <q-item dense clickable v-close-popup @click="restoreInNewWindow(tabset.id)">&ndash;&gt;-->
      <!--&lt;!&ndash;                <q-item-section>new window</q-item-section>&ndash;&gt;-->
      <!--&lt;!&ndash;              </q-item>&ndash;&gt;-->
      <!--&lt;!&ndash;              <q-item dense clickable v-close-popup @click="restoreInGroup(tabset.id)">&ndash;&gt;-->
      <!--&lt;!&ndash;                <q-item-section>current window</q-item-section>&ndash;&gt;-->
      <!--&lt;!&ndash;              </q-item>&ndash;&gt;-->
      <!--&lt;!&ndash;            </q-list>&ndash;&gt;-->
      <!--&lt;!&ndash;          </q-menu>&ndash;&gt;-->

      <!--        </ContextMenuItem>-->

      <!--      </template>-->

      <template v-if="tabset.tabs.length > 0 && inBexMode() &&
            tabset.window && tabset.window !== 'current'">
        <!--        <ContextMenuItem v-close-popup-->
        <!--                         @was-clicked="restoreInGroup(tabset.id, tabset.window)"-->
        <!--                         icon="open_in_new"-->
        <!--                         label="Open in window..."/>-->
      </template>

      <!--      <ContextMenuItem v-if="useTabsetsStore().tabsets.size > 1"-->
      <!--                       v-close-popup-->
      <!--                       @was-clicked="focus(tabset)"-->
      <!--                       icon="filter_center_focus"-->
      <!--                       color="accent"-->
      <!--                       label="Focus on tabset"/>-->

      <!--      <template v-if="tabset.status === TabsetStatus.DEFAULT && useTabsetsStore().tabsets.size > 1">-->
      <!--        <ContextMenuItem v-close-popup-->
      <!--                         @was-clicked="pin(tabset)"-->
      <!--                         icon="o_push_pin"-->
      <!--                         color="warning"-->
      <!--                         label="Pin"/>-->
      <!--      </template>-->
      <!--      <template v-else-if="tabset.status === TabsetStatus.FAVORITE">-->
      <!--        <ContextMenuItem v-close-popup-->
      <!--                         @was-clicked="unpin(tabset)"-->
      <!--                         icon="push_pin"-->
      <!--                         color="warning"-->
      <!--                         label="Unpin"/>-->

      <!--      </template>-->

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

      <!--      <q-separator inset v-if="usePermissionsStore().hasFeature(FeatureIdent.TABSETS_SHARING)" />-->

      <!--      <template v-if="useSettingsStore().isEnabled('dev')">-->
      <!--        <ContextMenuItem v-close-popup-->
      <!--                         @was-clicked="useSearchStore().reindexTabset(tabset.id)"-->
      <!--                         icon="o_note"-->
      <!--                         label="Re-Index Search (dev)"/>-->

      <!--        <q-separator inset/>-->
      <!--      </template>-->


      <ContextMenuItem v-close-popup
                       @was-clicked="startTabsetNote(tabset as Tabset)"
                       icon="o_note"
                       label="Add Note to Tabset">
      </ContextMenuItem>

      <q-separator inset v-if="showSharingFeatures()"/>

      <ContextMenuItem
        v-if="showSharingFeatures() && (tabset.sharing === TabsetSharing.UNSHARED || !tabset.sharing)"
        v-close-popup
        @was-clicked="shareTabsetPubliclyDialog(tabset)"
        icon="ios_share"
        color="warning"
        label="Share as link..."/>

      <ContextMenuItem v-if="showSharingFeatures() && tabset.sharing === TabsetSharing.PUBLIC_LINK_OUTDATED"
                       v-close-popup
                       @was-clicked="shareTabsetPubliclyDialog(tabset, true)"
                       icon="ios_share"
                       color="warning"
                       label="Republish">
        <q-tooltip class="tooltip-small">Tabset has changed, republish</q-tooltip>
      </ContextMenuItem>

      <ContextMenuItem
        v-if="tabset.sharing === TabsetSharing.PUBLIC_LINK || tabset.sharing === TabsetSharing.PUBLIC_LINK_OUTDATED"
        v-close-popup
        @was-clicked="removePublicShare(tabset.id, tabset.sharedId || '')"
        icon="ios_share"
        color="warning"
        label="Stop Sharing">
        <q-tooltip class="tooltip-small">Delete Shared Link</q-tooltip>
      </ContextMenuItem>

      <q-separator inset/>

      <ContextMenuItem v-close-popup
                       @was-clicked="deleteTabsetDialog(tabset as Tabset)"
                       icon="o_delete"
                       color="negative"
                       :disable="tabset.sharedId !== undefined"
                       label="Delete Tabset">
      </ContextMenuItem>

    </q-list>
  </q-menu>

</template>

<script lang="ts" setup>

import {Tabset, TabsetSharing} from "src/tabsets/models/Tabset";
import {useQuasar} from "quasar";
import {useUtils} from "src/core/services/Utils";
import ContextMenuItem from "pages/sidepanel/helper/ContextMenuItem.vue";
import {PropType} from "vue";
import {useRouter} from "vue-router";
import DeleteTabsetDialog from "src/tabsets/dialogues/DeleteTabsetDialog.vue";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {DeleteTabsetCommand} from "src/tabsets/commands/DeleteTabset";
import NavigationService from "src/services/NavigationService";
import {useFeaturesStore} from "src/features/stores/featuresStore";
import {FeatureIdent} from "src/app/models/FeatureIdent";
import ShareTabsetPubliclyDialog from "src/tabsets/dialogues/ShareTabsetPubliclyDialog.vue";
import {UnShareTabsetCommand} from "src/tabsets/commands/UnShareTabsetCommand";
import {useSettingsStore} from "stores/settingsStore";

const {inBexMode} = useUtils()

const $q = useQuasar()
const router = useRouter()

const props = defineProps({
  tabset: {type: Object as PropType<Tabset>, required: true}
})

const emits = defineEmits(['editHeaderDescription'])


const deleteTabsetDialog = (tabset: Tabset) => {
  if (tabset.tabs.length === 0) {
    useCommandExecutor().executeFromUi(new DeleteTabsetCommand(tabset.id))
      .then((res: any) => {
        router.push("/sidepanel/collections")
      })
    return
  }
  $q.dialog({
    component: DeleteTabsetDialog,
    componentProps: {
      tabsetId: tabset.id,
      tabsetName: tabset.name,
      tabsCount: tabset.tabs.length,
      redirectTo: "/sidepanel/collections"
    }
  })
}

const startTabsetNote = (tabset: Tabset) => {
  const url = chrome && chrome.runtime && chrome.runtime.getURL ?
    chrome.runtime.getURL('www/index.html') + "#/mainpanel/notes/?tsId=" + tabset.id + "&edit=true" :
    "#/mainpanel/notes/?tsId=" + tabset.id + "&edit=true"
  NavigationService.openOrCreateTab([url])
}

const shareTabsetPubliclyDialog = (tabset: Tabset, republish: boolean = false) => {
  $q.dialog({
    component: ShareTabsetPubliclyDialog,
    componentProps: {
      tabsetId: tabset.id,
      sharedId: tabset.sharedId,
      tabsetName: tabset.name,
      republish: republish
    }
  })
}

const removePublicShare = (tabsetId: string, sharedId: string) => useCommandExecutor().executeFromUi(new UnShareTabsetCommand(tabsetId, sharedId))

const showSharingFeatures = () =>
  useFeaturesStore().hasFeature(FeatureIdent.TABSETS_SHARING) && !useSettingsStore().isEnabled('localMode')


</script>
