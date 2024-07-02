<template>
  <form>


    <div class="q-pa-md example-column-equal-width">

      <div class="column q-mt-xl">
        <div class="text-h6">
          Bibbly
        </div>
        <div class="col q-mt-md">
          Your Email Address
        </div>
        <div class="col">
          <q-input id="username" square filled type="email" v-model="email" dense tabindex="1" autofocus/>
        </div>
        <div class="col q-mt-md">
          Password
        </div>
        <div class="col">
          <q-input id="password" square filled type="password" v-model="password" dense tabindex="2"/>
        </div>
        <div class="col q-mt-xl">
          <q-btn :label="registerMode ? 'Register':'Log in'" style="width:100%"
                 tabindex="3"
                 color="primary"
                 :loading="password.length === 0 && loading"
                 :disable="mailSent"
                 @click="signin()"/>
        </div>

        <div v-if="registerMode" class="q-ma-sm text-body2">
          By clicking on <em>Register</em> your comply with the Terms of service.
        </div>

        <div class="col q-mt-lg text-center cursor-pointer text-bold text-primary" @click="toggleRegister()"
             v-html="registerMode ? 'Log in':'Register'"></div>

      </div>
    </div>

  </form>
</template>

<script lang="ts" setup>

import {ref} from "vue";
import {LocalStorage} from "quasar";
import NavigationService from "src/services/NavigationService.js";
import {defineComponent} from "vue";
import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, UserCredential} from "firebase/auth";
import {CURRENT_USER_EMAIL} from "boot/constants";
import {useAuthStore} from "stores/authStore";
import {NotificationType, useNotificationHandler} from "src/core/services/ErrorHandler";
import {useRouter} from "vue-router";

const email = ref('')//LocalStorage.getItem(CURRENT_USER_EMAIL))
const password = ref('')
const loading = ref<boolean>(false)
const mailSent = ref<boolean>(false)
const registerMode = ref(false)

const router = useRouter()

const {handleError} = useNotificationHandler()

const toggleRegister = () => registerMode.value = !registerMode.value

const signin = async () => {
  loading.value = true
  const auth = getAuth();
  try {
    let userCredential: UserCredential = null as unknown as UserCredential
    if (registerMode.value) {
      userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    }
    const user = userCredential.user;
    LocalStorage.set(CURRENT_USER_EMAIL, email.value);
    //console.log("user!!!", user)
    useAuthStore().setUser(user)
    loading.value = false
    router.push("/sidepanel")
    // emits('hideLogin')
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("error", error, typeof error, errorCode, errorMessage)
    switch (errorCode) {
      case "auth/invalid-credential":
        handleError("Invalid Credentials or No Account", NotificationType.TOAST)
        break
      default:
        handleError(error, NotificationType.TOAST)
    }
    loading.value = false
  }
}

</script>
