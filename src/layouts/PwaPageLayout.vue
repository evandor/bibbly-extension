<template>
  <q-layout view="hHh LpR lFr">
    <q-header elevated>
      <q-toolbar>

        <q-img
          class="q-ml-xs q-mr-none cursor-pointer" style="margin-top:-7px"
          src="favicon.ico" height="32px" width="32px"/>
        <q-toolbar-title>
          Tabsets
        </q-toolbar-title>


        <q-space/>

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" behavior="desktop" bordered>
      <Navigation></Navigation>
    </q-drawer>

<!--    <q-drawer v-model="useUiStore().rightDrawerOpen" side="right" bordered-->
<!--              content-class="column justify-between no-wrap bg-grey-1">-->
<!--      <DrawerRight/>-->

<!--    </q-drawer>-->

    <q-page-container>
      <router-view/>
      <!--      <div id="fixed-footer" class="q-pl-md q-pa-xs">{{ useUiStore().footerInfo }}</div>-->
    </q-page-container>

  </q-layout>

</template>

<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {useMeta, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import Navigation from "src/components/Navigation.vue"
import _ from "lodash";
import {useSpacesStore} from "src/spaces/stores/spacesStore"
import {useUtils} from "src/core/services/Utils";
import {Suggestion, SuggestionState} from "src/suggestions/models/Suggestion";
import {useSuggestionsStore} from "src/suggestions/stores/suggestionsStore";

const $q = useQuasar()
const router = useRouter()

const leftDrawerOpen = ref($q.screen.gt.lg)

const spacesStore = useSpacesStore()

const spacesOptions = ref<object[]>([])
const suggestions = ref<Suggestion[]>(useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]))
const search = ref('')

const {inBexMode} = useUtils()

$q.loadingBar.setDefaults({
  color: 'positive',
  size: '10px',
  position: 'top'
})

const settingsClicked = ref(false)

watchEffect(() => {
  suggestions.value = useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED])
})

watchEffect(() => {
  spacesOptions.value = _.map([...spacesStore.spaces.keys()], key => {
    const label = spacesStore.spaces.get(key)?.label || 'undef'
    return {id: key, label: label}
  })
    .concat({id: '', label: '(unassigned)'})
    .concat({id: '', label: 'create new space'})
})

//@ts-ignore
const appVersion = import.meta.env.PACKAGE_VERSION

useMeta(() => {
  return {
    // @ts-ignore
    title: 'Tabsets Extension' //+ appVersion
  }
})




</script>
