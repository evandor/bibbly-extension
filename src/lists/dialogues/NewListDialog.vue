<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <NewListDialogBody :name="props.name"/>
  </q-dialog>
</template>

<script lang="ts" setup>

import {useDialogPluginComponent} from "quasar";
import NewTabsetDialogBody from "components/dialogues/helper/NewTabsetDialogBody.vue";
import NewListDialogBody from "src/lists/dialogues/NewListDialogBody.vue";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  name: {type: String, default: ""}
})

const {dialogRef, onDialogHide} = useDialogPluginComponent()

</script>
