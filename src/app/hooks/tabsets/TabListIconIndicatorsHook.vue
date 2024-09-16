<template>
  <q-icon v-if="showResearchIndicator"
          @click="openResearchPage()"
          name="o_science" size="xs" color="primary" class="q-mr-xs">
    <q-tooltip class="tooltip-small">This Source has associcated reasearch data</q-tooltip>
  </q-icon>
</template>

<script lang="ts" setup>

import {useSnapshotsStore} from "src/snapshots/stores/SnapshotsStore";
import {ref, watchEffect} from "vue";
import {openURL} from "quasar";
import {useRouter} from "vue-router";

const props = defineProps({
  tabId: {type: String, required: true},
  tabUrl: {type: String, required: true}
})

const router = useRouter()

const showResearchIndicator = ref(false)

watchEffect(async () => {
  showResearchIndicator.value = (await useSnapshotsStore().metadataFor(props.tabId)).length > 0
})

const openResearchPage = () => {
  openURL(props.tabUrl)
  router.push('/sidepanel/research/' + props.tabId)
}

</script>
