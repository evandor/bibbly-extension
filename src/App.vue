<template>
  <router-view/>
</template>

<script setup lang="ts">

import {setCssVar, useQuasar} from "quasar";
import AppService from "src/app/AppService";
import {onAuthStateChanged, signInAnonymously} from "firebase/auth";
import {useRoute, useRouter} from "vue-router";
import FirebaseServices from "src/services/firebase/FirebaseServices";
import {useNotificationHandler} from "src/core/services/ErrorHandler";
import {CURRENT_USER_ID} from "boot/constants";
import {useAppStore} from "stores/appStore";
import {useSettingsStore} from "stores/settingsStore";
import {useUiStore} from "src/ui/stores/uiStore";

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const {handleError} = useNotificationHandler()

const settingsStore = useSettingsStore()
settingsStore.initialize($q.localStorage)
const localMode = settingsStore.isEnabled('localMode')
console.log(` ...config: localMode=${localMode}`)

useAppStore().init()

if (!localMode) {
  FirebaseServices.init()

  const auth = FirebaseServices.getAuth()

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log(`%conAuthStateChanged: logged in (anonymously: ${auth.currentUser?.isAnonymous})`, "border:1px solid green")

      try {
        await AppService.init($q, router, true, user)
        useUiStore().networkOnline = true
      } catch (error: any) {
        console.log("%ccould not initialize appService due to " + error, "background-color:orangered")
        console.error("error", error, typeof error, error.code, error.message)
        handleError(error.code)
        if (error.code === 'unavailable') {
          useUiStore().networkOnline = false
        }
        return Promise.resolve()
      }

    } else {
      // User is signed out
      console.log("%conAuthStateChanged: logged out", "border:1px solid green", route.path)

      if (route.path.startsWith("/pwa/imp/")) {
        signInAnonymously(auth)
          .then(() => {
            console.log("%conAuthStateChanged: anonymous login", "border:1px solid green")
          })
          .catch((error) => {
            console.warn("%conAuthStateChanged: got error:", error, "border:1px solid green")
          });
      } else {
        await router.push("/sidepanel/login")
      }
    }
  });
}

let useDarkMode: string = $q.localStorage.getItem('darkMode') || "auto" as string

if ($q.platform.is.safari && !$q.platform.is.bex) {
  console.log("switching dark mode default to false on safari non-bex")
  useDarkMode = $q.localStorage.getItem('darkMode') || "false" as string
}

if (useDarkMode === "true") {
  $q.dark.set(true)
} else if (useDarkMode === "false") {
  $q.dark.set(false)
} else {
  $q.dark.set("auto")
}

if (useDarkMode === "true") {
  setCssVar('primary', '#D9E8F5');
  setCssVar('secondary', '#26A69A');
  setCssVar('accent', '#9C27B0');
  setCssVar('dark', '#1d1d1d');
  setCssVar('positive', '#21BA45');
  setCssVar('negative', '#C10015');
  setCssVar('info', '#31CCEC');
  setCssVar('separator', '#AA0099');
  // setCssVar('warning', 'green');
}

const currentUser = $q.localStorage.getItem(CURRENT_USER_ID)
if (currentUser && !localMode) {
  console.log("current user id found, waiting for auto-login")
  // we should be logged in any second
} else {
  setTimeout(() => {
    // triggers, but app should already have been started, no restart enforced
    console.debug("App.vue start fallback after 1000ms")
    AppService.init($q, router, false)
  }, 1000)
}

</script>
