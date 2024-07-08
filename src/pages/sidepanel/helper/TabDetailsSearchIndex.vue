<template>
  <div class="col-12 text-caption">
    <div v-for="(k,index) in searchIndex">
      <div class="row" v-if="searchIndex.get(index)['v']">
        <div class="col-4 q-ml-sm text-bold">
          {{ searchIndex.get(index)['name'] }}
        </div>
        <div class="col-7 ellipsis">
          {{ searchIndex.get(index)['v'] }}
          <q-tooltip class="tooltip">{{ searchIndex.get(index)['v'] }}</q-tooltip>
        </div>
        <div class="col text-right">
          <q-icon name="o_check_circle" color="primary"/>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts" setup>

import {onMounted, ref, watchEffect} from "vue";
import {Tab} from "src/tabsets/models/Tab";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";

const props = defineProps({
  tabId: {type: String, required: true}
})

const tab = ref<Tab | undefined>(undefined)
const searchIndex = ref<any>()

onMounted(() => {
  const tabObject = useTabsetsStore().getTabAndTabsetId(props.tabId)
  if (tabObject) {
    tab.value = tabObject.tab
  }
})

</script>
