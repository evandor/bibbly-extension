
<template>
  <q-menu :offset="[0, 0]">
    <q-list dense style="min-width: 200px">
<!--      <template v-if="showTabDetailsMenuEntry(props['tab' as keyof object])">-->
<!--        <q-item clickable v-close-popup @click.stop="showTabDetails(props['tab' as keyof object])">-->
<!--          <q-item-section style="padding-right:0;min-width:25px;max-width: 25px;">-->
<!--            <q-icon size="xs" name="o_info" color="accent"/>-->
<!--          </q-item-section>-->
<!--          <q-item-section>-->
<!--            Show Tab Details (dev)-->
<!--          </q-item-section>-->
<!--        </q-item>-->
<!--      </template>-->

<!--      <q-separator inset/>-->
<!--      <q-item clickable v-close-popup @click.stop="editURL(props['tab' as keyof object])">-->
<!--        <q-item-section style="padding-right:0;min-width:25px;max-width: 25px;">-->
<!--          <q-icon size="xs" name="o_edit" color="info"/>-->
<!--        </q-item-section>-->
<!--        <q-item-section>-->
<!--          Edit Tab-->
<!--        </q-item-section>-->
<!--      </q-item>-->

<!--      <template v-if="props.tabset?.type.toString() !== TabsetType.DYNAMIC.toString()">-->
<!--        <q-item clickable-->
<!--                v-close-popup @click.stop="addCommentDialog()">-->
<!--          <q-item-section style="padding-right:0;min-width:25px;max-width: 25px;">-->
<!--            <q-icon size="xs" name="o_note" color="info"/>-->
<!--          </q-item-section>-->
<!--          <q-item-section>-->
<!--            Add Comment-->
<!--          </q-item-section>-->
<!--        </q-item>-->
<!--      </template>-->


<!--      <template v-if="useAuthStore().isAuthenticated">-->
<!--        <q-separator inset/>-->
<!--        <q-item clickable v-close-popup @click.stop="openSimilar()">-->
<!--          <q-item-section style="padding-right:0;min-width:25px;max-width: 25px;">-->
<!--            <q-icon size="xs" name="o_equal"/>-->
<!--          </q-item-section>-->
<!--          <q-item-section>-->
<!--            Open similar websites-->
<!--          </q-item-section>-->
<!--        </q-item>-->
<!--      </template>-->

      <q-item clickable v-close-popup @click="router.push('/sidepanel/research/' + props.source.id)">
        <q-item-section style="padding-right:0;min-width:25px;max-width: 25px;">
          <q-icon size="xs" name="o_edit" color="primary"/>
        </q-item-section>
        <q-item-section>
          Research
        </q-item-section>
      </q-item>

      <q-separator inset/>

      <q-item clickable v-close-popup @click.stop="deleteTab()">
        <q-item-section style="padding-right:0;min-width:25px;max-width: 25px;">
          <q-icon size="xs" name="o_delete" color="negative"/>
        </q-item-section>
        <q-item-section>
          Delete
        </q-item-section>
      </q-item>

    </q-list>
  </q-menu>
</template>

<script lang="ts" setup>

import {PropType, ref} from "vue";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {Notify, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import {Source} from "src/projects/models/Source";
import {useNotificationHandler} from "src/core/services/ErrorHandler";
import {DeleteSourceCommand} from "src/projects/commands/DeleteSourceCommand";
import {Project} from "src/projects/models/Project";

const {handleSuccess, handleError} = useNotificationHandler()

const props = defineProps({
 // tab: {type: Object as PropType<Tab>, required: true},
  project: {type: Object as PropType<Project>, required: true},
  source: {type: Object as PropType<Source>, required: true}
})

const emit = defineEmits(['toggleExpand']);

const $q = useQuasar()
const router = useRouter()

const theColor = ref<string | undefined>(undefined)

// async function tabToUse(tab: Tab) {
//   let useTab: Tab = tab
//   if (tab.placeholders?.templateId) {
//     const tabInfo = useTabsetsStore().getTabAndTabsetId(tab.placeholders?.templateId)
//     if (tabInfo) {
//       useTab = tabInfo.tab
//       console.log("useTab", useTab, tab.placeholders?.templateId)
//     }
//   }
//   return useTab;
// }

// const openSimilar = async () => {
//   console.log("finding similar websites for", props.tab.url)
//   try {
//     const url = new URL(props.tab.url || '')
//     const hostname = url.hostname
//     const res = await api.post("https://us-central1-tabsets-dev.cloudfunctions.net/app/ra/similar", {"domain": hostname})
//     const data = res.data
//     console.log("res", res, data['similar_sites'])
//     if (data['similar_sites']) {
//       const urls = _.map(data['similar_sites'], (u:any) => "https://" + u)
//       NavigationService.openOrCreateTab(urls)
//       handleSuccess(new ExecutionResult("done", "opening " + urls.length + " similar page(s)"))
//     }
//   } catch (err) {
//     console.log("got error", err)
//     handleError("not able to find similar pages", NotificationType.TOAST)
//   }
// }

const deleteTab = async () => {
  useCommandExecutor().executeFromUi(new DeleteSourceCommand(props.source, props.project))
}


// const addCommentDialog = () => $q.dialog({
//   component: CommentDialog,
//   componentProps: {tabId: props.tab.id, sharedId: props.tabset?.sharedId}
// })

// const showTabDetails = async (tab: Tab) => {
//   const useTab: Tab = await tabToUse(tab)
//   console.log("showing tab details for", useTab)
//   router.push("/sidepanel/tab/" + useTab.id)
// }
//
// const showTabDetailsMenuEntry = (tab: Tab) =>
//   useFeaturesStore().hasFeature(FeatureIdent.DEV_MODE)
// //&& !(tab.placeholders?.type === PlaceholdersType.URL_SUBSTITUTION)
//
// const deleteTabLabel = (tab: Tab) =>
//   (tab.placeholders && tab.placeholders.type === PlaceholdersType.URL_SUBSTITUTION) ?
//     'Delete all'
//     :
//     'Delete Tab'
//
//
// const editURL = async (tab: Tab) => {
//   let useTab = await tabToUse(tab);
//   $q.dialog({
//     component: EditUrlDialog,
//     componentProps: {
//       tab: useTab
//     }
//   })
// }

// const assignTab = async (tab: Tab) =>
//   await NavigationService.openOrCreateTab([chrome.runtime.getURL("/www/index.html#/mainpanel/tabAssignment/" + tab.id)])
//
//
// const setColor = (tab: Tab) => useCommandExecutor().execute(new UpdateTabColorCommand(tab, theColor.value))


</script>
