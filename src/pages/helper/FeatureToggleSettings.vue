<template>
  <div class="q-pa-md q-gutter-sm">


    <!--    <q-banner v-if="!useAuthStore().userMayAccess(AccessItem.FEATURE_TOGGLES)" rounded style="border:1px solid orange">-->
    <!--      To use feature toggles, you need to have a (free) account.-->
    <!--    </q-banner>-->
    <!--    <template v-else>-->
    <q-banner rounded style="border:1px solid orange">Switch on experimental features (or off). These feature toggles
      are meant for developers
      only as they might break functionality and/or destroy data. Once they are considered 'safe enough', they will
      be
      available at the
      "experimental features" view on the left.
    </q-banner>

    <div class="row q-pa-md">
      <div class="col-3"><b>Developer Mode</b></div>
      <div class="col-3">activates a couple of experimental features and debug insights. You should only use this
        if you can live with loosing data.
      </div>
      <div class="col-1"></div>
      <div class="col-5">
        <q-toggle v-model="devEnabled" @click="updateSettings(FeatureIdent.DEV_MODE.toString(), devEnabled)"/>
      </div>
    </div>
    <div class="row q-pa-md">
      <div class="col-3"><b>Local Persistence Mode</b></div>
      <div class="col-3">
        Use the browser's local database if you do not want to store your data in the cloud. Some
        features like sharing etc. will not work with this mode.<br><br>
        <b>The Extension will be reloaded after changing this setting.</b>
      </div>
      <div class="col-1"></div>
      <div class="col-5">
        <q-toggle v-model="localModeToggle" @click="toggleLocalMode()"/>
      </div>
    </div>
    <div class="row q-pa-md" v-if="devEnabled">
      <div class="col-3"><b>Trigger Error Handler</b></div>
      <div class="col-3">this should initiate a rollbar error message.
      </div>
      <div class="col-1"></div>
      <div class="col-5">
        <q-btn label="Trigger Error" no-caps @click="triggerErrorHandler()"/>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";
import {useSettingsStore} from "stores/settingsStore";
import {useUtils} from "src/core/services/Utils";
import {useAuthStore} from "stores/authStore";
import {FeatureIdent} from "src/app/models/FeatureIdent";
import {useNotificationHandler} from "src/core/services/ErrorHandler";

const {sendMsg} = useUtils()

const settingsStore = useSettingsStore()
const {handleError} = useNotificationHandler()

const devEnabled = ref<boolean>(settingsStore.isEnabled('dev'))

const localModeToggle = ref<boolean>(settingsStore.isEnabled('localMode'))

watchEffect(() => {
  devEnabled.value = settingsStore.isEnabled('dev')
})

watchEffect(() => {
  localModeToggle.value = settingsStore.isEnabled('localMode')
})

const updateSettings = async (ident: string, val: boolean) => {
  console.log("settings updated to", ident, val)
  settingsStore.setFeatureToggle(ident, val)
  if (val) {
    await useAuthStore().logout()
  }
  //AppService.restart("/")
  sendMsg('restart-application', {initiatedBy: "FeatureToggleSettings"})
}

const toggleLocalMode = () => {
  updateSettings('localMode', localModeToggle.value)
  setTimeout(() => {
    window.close()
  }, 1000)
}

const triggerErrorHandler = () =>
  handleError("an user-initated error message from bibbly at " + new Date().getTime())


</script>
