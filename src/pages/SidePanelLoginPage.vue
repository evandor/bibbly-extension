<template>
  <form>


    <div class="q-pa-md example-column-equal-width">

      <div class="column q-mt-xl">
        <div class="text-caption">
          Please log in or create an account @
        </div>
        <div class="text-h6">
          Bibbly
        </div>
        <div class="col q-mt-md">
          Your Email Address
        </div>
        <div class="col">
          <q-input id="username" square filled type="email"
                   v-model="email"
                   dense tabindex="1" autofocus
                   autocomplete="on"/>
        </div>

        <template v-if="isValidEmail(email)">
          <div class="col q-mt-md">
            Password
          </div>
          <div class="col">
            <q-input id="password" square filled type="password"
                     v-model="password"
                     dense tabindex="2"/>
          </div>

          <div class="col q-mt-xl" v-if="password">
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

          <div v-if="password"
               class="col q-mt-lg text-center cursor-pointer text-bold text-primary" @click="toggleRegister()"
               v-html="registerMode ? 'Log in':'Register'">
          </div>
        </template>

        <div v-if="showResetPassword" class="col q-mt-lg text-center cursor-pointer text-blue-10"
             @click="resetPassword()">
          Reset Password
        </div>

        <!--        <template v-if="!registerMode">-->
        <!--          <div class="q-ma-sm text-body2 q-mt-xl text-grey">-->
        <!--            If you do not want to create an account, use the-->
        <!--          </div>-->
        <!--          <div class="q-ma-sm text-body2 text-center text-blue-10 cursor-pointer" @click="useLocalMode()">-->
        <!--            Local Mode-->
        <!--          </div>-->
        <!--          <div class="q-ma-sm text-body2 text-grey text-justify">-->
        <!--            Some features like sharing will not work in this mode. Your data is stored-->
        <!--            solely in your browser's local database. You can create an account later if-->
        <!--            you wish and import your data.-->
        <!--          </div>-->

        <!--        </template>-->


      </div>
    </div>

  </form>
</template>

<script lang="ts" setup>

import {ref} from "vue";
import {LocalStorage} from "quasar";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  UserCredential
} from "firebase/auth";
import {CURRENT_USER_EMAIL} from "boot/constants";
import {useAuthStore} from "stores/authStore";
import {NotificationType, useNotificationHandler} from "src/core/services/ErrorHandler";
import {useRouter} from "vue-router";
import {useSettingsStore} from "stores/settingsStore";
import AppService from "src/app/AppService";
import {ExecutionResult} from "src/core/domain/ExecutionResult";

const email = ref('')//LocalStorage.getItem(CURRENT_USER_EMAIL))
const password = ref('')
const loading = ref<boolean>(false)
const mailSent = ref<boolean>(false)
const registerMode = ref(false)
const showResetPassword = ref(false)

const router = useRouter()

const {handleError, handleSuccess} = useNotificationHandler()

const toggleRegister = () => registerMode.value = !registerMode.value

const signin = async () => {
  loading.value = true
  const auth = getAuth();
  try {
    let userCredential: UserCredential = null as unknown as UserCredential
    //console.log(`signing with ${email.value} and password length ${password.value.length}`)
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
    showResetPassword.value = true
    switch (errorCode) {
      case "auth/invalid-credential":
        handleError("Invalid Credentials or No Account", NotificationType.TOAST)
        break
      default:
        console.error("error", error, typeof error, errorCode, errorMessage)
        handleError(error, NotificationType.TOAST)
    }
    loading.value = false
  }
}

const useLocalMode = () => {
  useSettingsStore().setFeatureToggle("localMode", true)
  //router.push("/sidepanel/welcome")
  AppService.restart("/sidepanel/welcome")
}

const resetPassword = () => {
  sendPasswordResetEmail(getAuth(), email.value)
    // .then((link:any) => {
    //   return sendCustomPasswordResetEmail(email.value, email.value, link);
    // })
    .then(() => {
      const dummyresult = new ExecutionResult<any>("", "Email was sent")
      handleSuccess(dummyresult, NotificationType.TOAST)
    })
    .catch((error) => {
      handleError(error, NotificationType.TOAST)
    });
}

const isValidEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
  return regex.test(email);
}
</script>
