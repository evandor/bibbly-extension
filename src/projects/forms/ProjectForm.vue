<template>
  <div class="row q-ma-none">
    <div class="col-12 text-body1">
      <q-icon name="list" class="q-mr-sm" color="primary" />New Project
    </div>
    <div class="col-12">
      <hr style="border-top: 1px solid #efefef">
    </div>
    <div class="col-12 q-mt-lg">
      <q-input class="q-my-sm" square outlined label="Name" v-model="name"/>
    </div>
    <div class="col-12">
      <q-input class="q-my-sm" type="textarea" square outlined label="Description" v-model="description"/>
    </div>
    <div class="col-12 q-my-lg">
      <q-btn class="q-mx-lg q-px-lg" outline rounded color="primary"
             @click="emits('skip')"
             label="skip"/>
      <q-btn class="q-mx-lg q-px-lg"
             style="background: #21B6A8; color: white"
             @click="emits('projectCreated', {name,description})"
             rounded label="add"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import {CreateProjectCommand} from "src/projects/commands/CreateProjectCommand";
import {ExecutionResult} from "src/core/domain/ExecutionResult";

const emits = defineEmits(['projectCreated', 'skip'])

const name = ref('')
const description = ref('')

</script>
