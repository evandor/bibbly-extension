<template>
  <q-layout view="hHh lpR fFf">

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer elevated>
      <SidePanelFooter />
    </q-footer>

  </q-layout>

</template>

<script setup lang="ts">

import {ref, watchEffect} from "vue";
import {useMeta, useQuasar} from "quasar";
import SidePanelBibblyFooter from "components/SidePanelBibblyFooter.vue";
import SidePanelFooter from "components/SidePanelFooter.vue";

const location = ref('')


useMeta(() => {
  //console.debug("using meta...")
  return {
    // @ts-ignore
    title: 'Tabsets Extension...' //+ appVersion
  }
})


watchEffect(() => location.value = window.location.href.split('/www/')[1] || window.location.href)


</script>
