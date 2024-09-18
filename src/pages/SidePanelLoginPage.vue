<template>
  <form>

    <div class="q-pa-md q-ma-md example-column-equal-width" style="border:1px solid #bfbfbf">


      <q-tabs
        v-model="tab"
        dense>
        <q-tab name="login" label="Login"/>
        <q-tab name="register" label="Create Account"/>
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="login">

          <div class="col q-mt-sm">
            <div class="row">
              <div class="col-12">Your Email Address</div>
            </div>
          </div>
          <div class="col">
            <q-input id="username" square filled type="email"
                     v-model="email"
                     :rules="[val => !!val || 'Please provide a valid email address']"
                     dense tabindex="1" autofocus
                     autocomplete="on"/>
          </div>

          <div class="col q-mt-sm">
            <div class="row">
              <div class="col-6">Your password</div>
              <div class="col-6 text-right"
                   :class="email && email.indexOf('@') > 0 ? 'text-blue-8 cursor-pointer':'text-blue-3'"
                   @click="promptReset()">Forgot?
              </div>
            </div>
          </div>
          <div class="col q-mt-sm">
            <q-input id="password" square filled :type="isPwd ? 'password' : 'text'"
                     v-model="password"
                     :rules="[val => !!val || 'the password must not be empty']"
                     dense tabindex="2">
              <template v-slot:append>
                <q-icon v-if="password"
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>

          <div class="col q-mt-md">
            <q-btn label="Log in" style="width:100%"
                   tabindex="3"
                   color="primary"
                   :loading="password.length === 0 && loading"
                   :disable="!email || !password"
                   @click="signin()"/>
          </div>

          <div class="col q-mt-sm text-right">
            <q-checkbox :disable="email ? email.indexOf('@') < 0 : true" label="Remember Me" v-model="rememberMe"/>
          </div>

        </q-tab-panel>

        <q-tab-panel name="register">

          <div class="col q-mt-sm">
            <div class="row">
              <div class="col-12">Your Email Address</div>
            </div>
          </div>
          <div class="col">
            <q-input id="username" square filled type="email"
                     v-model="email"
                     :rules="[val => !!val || 'Please provide a valid email address']"
                     dense tabindex="1" autofocus
                     autocomplete="on"/>
          </div>

          <div class="col q-mt-sm">
            <div class="row">
              <div class="col-12">Provide a password</div>
            </div>
          </div>
          <div class="col">
            <q-input id="password" square filled type="password"
                     v-model="password"
                     dense tabindex="2"/>
          </div>

          <div class="col q-mt-xl">
            <q-btn label="Register" style="width:100%"
                   tabindex="3"
                   color="primary"
                   :loading="password.length === 0 && loading"
                   :disable="!email || !password"
                   @click="signin()"/>
          </div>

          <div class="q-ma-sm text-body2">
            By clicking on <em>Register</em> your comply with the Terms of service.
          </div>


        </q-tab-panel>

      </q-tab-panels>

    </div>

  </form>
</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";
import {LocalStorage, useQuasar} from "quasar";
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
import {ExecutionResult} from "src/core/domain/ExecutionResult";

const $q = useQuasar()

const email = ref<string>(LocalStorage.getItem(CURRENT_USER_EMAIL) as string)
const password = ref('')
const loading = ref<boolean>(false)
const registerMode = ref(false)
const isPwd = ref(true)
const showResetPassword = ref(false)
const rememberMe = ref(LocalStorage.getItem(CURRENT_USER_EMAIL) !== null)
const tab = ref('login')

const router = useRouter()

const {handleError, handleSuccess} = useNotificationHandler()

watchEffect(() => {
  if (email.value && email.value.length === 0) {
    LocalStorage.remove(CURRENT_USER_EMAIL)
    rememberMe.value = false
  }
})

watchEffect(() => {
  if (!rememberMe.value) {
    LocalStorage.remove(CURRENT_USER_EMAIL)
    rememberMe.value = false
  }
})

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
    if (rememberMe.value) {
      LocalStorage.set(CURRENT_USER_EMAIL, email.value);
    } else {
      LocalStorage.remove(CURRENT_USER_EMAIL)
    }
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

const promptReset = () => {
  $q.dialog({
    title: 'Reset Password?',
    message: 'Your email',
    prompt: {
      model: email.value,
      type: 'text' // optional
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    resetPassword()
  })
}
</script>
