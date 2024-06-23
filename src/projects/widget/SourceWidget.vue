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
      {{props.source.name}}
    </q-item-label>
  </q-item-section>

  <q-item-section class="q-mb-sm" @click="router.push('/sidepanel/source/' + props.source.id)">
    <q-item-label>
      ...
    </q-item-label>
  </q-item-section>

</template>

<script lang="ts" setup>

import {PropType} from "vue";
import {Source} from "src/projects/models/Source";
import {openURL} from "quasar";
import {useRouter} from "vue-router";

const props = defineProps({
  source: {type: Object as PropType<Source>, required: true}
})

const router = useRouter()

</script>
