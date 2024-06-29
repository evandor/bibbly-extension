<template>

  <q-footer class="q-pa-xs q-mt-sm darkInDarkMode brightInBrightMode" style="border-top: 1px solid lightgrey">


    <div class="row fit justify-content-center">
      <div class="col q-ma-sm text-grey items-center cursor-pointer" @click="openURL('https://tabsets.web.app/#/privacy')">
        Privacy
      </div>
      <div class="col q-ma-sm text-grey items-center cursor-pointer" @click="openURL('https://tabsets.web.app/#/tos')">
        Terms of Use
      </div>
      <div class="col text-right q-ma-sm text-grey" @click="toggleViews()">
        Contact
      </div>
    </div>

  </q-footer>
</template>
<script setup lang="ts">
import {onMounted, ref, watch, watchEffect} from "vue";
import {openURL} from "quasar";
import {useRoute, useRouter} from "vue-router";

const toggle = ref(false)

const router = useRouter()
const route = useRoute()

const toggleViews = () => {
  console.log(route.path)
  if (route.path === '/sidepanel') {
    router.push('/sidepanel/projects')
  } else {
    router.push('/sidepanel')
  }
}
</script>
