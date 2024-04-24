<template>
  <div class="row q-ma-md q-pa-md bg-white items-start"
       style="position: absolute;bottom:10px;top:110px;left:5px;right:5px;">
    <div class="col-12 text-body1">
      New Project
    </div>
    <div class="col-12">
      <q-input label="Name" v-model="name"/>
    </div>
    <div class="col-12">
      <q-input label="Description" v-model="description"/>
    </div>
    <div class="col-12 q-my-lg">
      <q-btn class="q-mx-lg q-px-lg" outline rounded color="primary" label="skip"/>
      <q-btn class="q-mx-lg q-px-lg"
             style="background: #21B6A8; color: white"
             @click="addProject()"
             rounded label="add"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {CreateProjectCommand} from "src/projects/commands/CreateProjectCommand";

const name = ref('')
const description = ref('')

const addProject = () =>
  useCommandExecutor().executeFromUi(new CreateProjectCommand(name.value, description.value))

</script>
