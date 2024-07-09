<template>

  <!-- left part: icon plus various -->
  <!--  @mouseover="hoveredTab = tab.id"-->
  <!--  @mouseleave="hoveredTab = undefined"-->
  <q-item-section class="q-mr-sm text-right" avatar>
    <div class="bg-grey-3 q-pa-none q-ma-none">

      <q-img class="rounded-borders" width="24px" height="24px" :src="props.source.favIconUrl"></q-img>

    </div>
  </q-item-section>

  <q-item-section class="q-mb-sm" @click="openURL(props.source.url)">
    <q-item-label>
      {{ props.source.name }}
    </q-item-label>
    <q-item-label v-if="hasResearchData()"
                  class="text-blue-10 cursor-pointer"
                  @click.stop="openResearchPage()"
                  caption>Research
    </q-item-label>
    <q-item-label v-else
                  class="text-blue-10 cursor-pointer"
                  @click.stop="startResearch()"
                  caption>Start Research
    </q-item-label>
  </q-item-section>

  <q-item-section class="q-mb-sm">
    <q-item-label>
      <q-icon name="more_horiz" color="black" size="16px"/>
      <PanelTabListContextMenu
        :project="props.project"
        :source="props.source"/>
    </q-item-label>
  </q-item-section>

</template>

<script lang="ts" setup>

import {PropType} from "vue";
import {Source} from "src/projects/models/Source";
import {openURL} from "quasar";
import {useRouter} from "vue-router";
import {useSnapshotsStore} from "src/snapshots/stores/SnapshotsStore";
import {BlobMetadata} from "src/snapshots/models/BlobMetadata";
import PanelTabListContextMenu from "src/tabsets/widgets/PanelTabListContextMenu.vue";
import {Project} from "src/projects/models/Project";

const props = defineProps({
  project: {type: Object as PropType<Project>, required: true},
  source: {type: Object as PropType<Source>, required: true}
})

const router = useRouter()

const openResearchPage = () => {
  window.open(chrome.runtime.getURL(`www/index.html#/mainpanel/html/${props.source.id}/${props.source.id}?i=0`));
}

const hasResearchData = () => {
  const mds: Map<string, BlobMetadata[]> = useSnapshotsStore().metadata
  console.log("mds", props.source.id, mds)
  return mds.get(props.source.id)
}

const startResearch = () => {
  //window.open(chrome.runtime.getURL(`www/index.html#/mainpanel/html/${props.source.id}/${props.source.id}?i=0`));
  openURL(props.source.url)
  router.push('/sidepanel/research/' + props.source.id)
}
</script>
