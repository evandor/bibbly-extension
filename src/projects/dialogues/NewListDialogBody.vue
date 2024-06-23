<template>
  <div>
    <q-form @submit.prevent="submit()" ref="theForm">

      <q-card class="q-dialog-plugin" style="max-width:100%">
        <q-card-section>
          <div class="text-h6" v-if="props.windowId">Save Windows Tabs as Tabset</div>
          <div class="text-h6" v-else>Add Tabset</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body">Name:</div>
          <q-input v-model="newTabsetName"
                   class="q-mb-md q-pb-none"
                   dense autofocus
                   @update:model-value="(val:string | number | null) => checkIsValid()"
                   :rules="[
                       (val:string) => Project.newTabsetNameIsValid(val) || 'Please do not use special Characters',
                       (val:string) => Project.newTabsetNameIsShortEnough(val) || 'the maximum length is 32',
                       (val:string) => doesNotExistYet(val) || 'Tabset already exists...'
                       ]"
                   data-testid="newTabsetName">
            <template v-slot:hint>
              <span class="text-negative"></span>
            </template>
          </q-input>

          <template v-if="inBexMode() && !props.windowId">

            <q-icon v-if="!props.windowId"
                    name="help" color="primary" size="1em">
              <q-tooltip>If you select this option, all currently open tabs will be added to your new tabset</q-tooltip>
            </q-icon>
          </template>
        </q-card-section>

        <q-card-section v-if="!props.windowId" >
          <q-select
            dense
            options-dense
            clearable
            clear-icon="close"
            label="Open in Window"
            filled
            v-model="windowModel"
            map-options
            use-input
            :options="windowOptions"
            input-debounce="0"
            @new-value="createWindowOption"

          />
        </q-card-section>



        <q-card-actions align="right">
          <DialogButton label="Cancel" color="primary" v-close-popup/>
            <DialogButton label="Add"
                          type="submit"
                          data-testid="newTabsetNameSubmit"
                          :disable="!isValid" v-close-popup/>
        </q-card-actions>

      </q-card>
    </q-form>
  </div>
</template>

<script lang="ts" setup>

import {useRouter} from "vue-router";
import {QForm, useDialogPluginComponent} from "quasar";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {ref, watchEffect} from "vue";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {SidePanelView, useUiStore} from "stores/uiStore";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useWindowsStore} from "src/windows/stores/windowsStore";
import {useUtils} from "src/services/Utils";
import DialogButton from "components/buttons/DialogButton.vue";
import {useTabsStore} from "src/projects/stores/tabsStore";
import {Project, TabsetStatus} from "src/projects/models/Project";
import {useTabsetService} from "src/projects/services/TabsetService2";
import {CreateProjectCommand} from "src/projects/commands/CreateProjectCommand";

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()
const {inBexMode} = useUtils()

const props = defineProps({
  spaceId: {type: String, required: false},
  name: {type: String, default: ""},
  windowId: {type: Number, required: false},
  fromPanel: {type: Boolean, default: false}
})

const tabsStore = useTabsStore()
const router = useRouter()

const newTabsetName = ref(props.name)
const isValid = ref(false)
const addAllOpenTabs = ref(props.windowId !== undefined)
const theForm = ref<QForm>(null as unknown as QForm)
const windowModel = ref<string>(null as unknown as string)
const windowOptions = ref<string[]>([])
const theColor = ref<string | undefined>(undefined)
const windowsStore = useWindowsStore()

watchEffect(() => {
  const windows: Set<string> = useWindowsStore().windowSet
  windowOptions.value = []
  windowOptions.value.push('current')
  const sortedWindowNames = Array.from(windows).sort();
  sortedWindowNames.forEach(windowName => {
    if (windowName !== "current") {
      windowOptions.value.push(windowName)
    }
  })
})

const checkIsValid = () => {
  if (theForm.value) {
    theForm.value.validate()
      .then((res) => {
        isValid.value = res
      })
  }
}

const doesNotExistYet = (val: string) => {
  const existsInTabset = tabsStore.existingInTabset(val)
  return !(existsInTabset && existsInTabset.status !== TabsetStatus.DELETED && existsInTabset.status !== TabsetStatus.ARCHIVED)
}

const submit = () => {
  console.log("submit", addAllOpenTabs.value, tabsStore.tabs, windowModel.value)
  const existsInTabset = tabsStore.existingInTabset(newTabsetName.value)
  if (existsInTabset && existsInTabset.status === TabsetStatus.ARCHIVED) {
    useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)
    useTabsetService().selectTabset(existsInTabset.id)
    //router.push("/sidepanel?first=")
  } else {
    let tabsToUse = addAllOpenTabs.value ? tabsStore.tabs : []
    if (props.windowId) {
      console.log("windowsStore", windowsStore)
      // TODO ignoring props.windowId !?!
      const window: chrome.windows.Window | undefined = windowsStore.currentChromeWindow
      if (window) {
        tabsToUse = window.tabs as chrome.tabs.Tab[]
        windowModel.value = newTabsetName.value
      }
    }
    useCommandExecutor()
      .executeFromUi(new CreateProjectCommand(newTabsetName.value, tabsToUse, windowModel.value, theColor.value))
      .then((res) => {
        if (!props.fromPanel) {
          router.push("/tabsets/" + res.result.tabsetId)
        } else {
          useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)
          router.push("/sidepanel?first=")
        }
      })
  }
}

const createWindowOption = (val: any, done: any) => {
  const sanitized = val ? val.replace(STRIP_CHARS_IN_USER_INPUT, '') : 'current'
  windowOptions.value.push(sanitized)
  console.log("calling done with", sanitized)
  done(sanitized, 'add-unique')
}


</script>
