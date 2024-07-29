<template>
  <div class="row q-ma-none q-mt-lg">
    <div class="col-5 text-caption text-bold">{{ title() }}</div>
    <div class="col-5 text-caption">{{ date.formatDate(created, 'DD.MM.YYYY HH:mm') }}</div>
    <div class="col-2 text-caption text-right">
      <q-icon v-if="props.predecessor"
              name="o_open_in_new" class="q-ml-xs cursor-pointer" @click="compareWith(props.predecessor)">
        <q-tooltip class="tooltip-small">Diff</q-tooltip>
      </q-icon>
      <q-icon name="o_open_in_new" class="q-ml-xs cursor-pointer" @click="openMhtml">
        <q-tooltip class="tooltip-small">Open</q-tooltip>
      </q-icon>
      <q-icon name="o_delete" class="q-ml-xs cursor-pointer" @click="deleteSnapshot()">
        <q-tooltip class="tooltip-small">Delete</q-tooltip>
      </q-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {date} from "quasar";
import {useSnapshotsService} from "src/snapshots/services/SnapshotsService";
import {BlobMetadata} from "src/snapshots/models/BlobMetadata";
import {PropType} from "vue";
import mhtml2html from "mhtml2html";

const props = defineProps({
  extension: {type: String, default: 'mhtml'},
  created: {type: Number, required: true},
  snapshotId: {type: String, required: true},
  predecessor: {type: Object as PropType<BlobMetadata | undefined>, default: undefined}
})

//const emits = defineEmits(['newSnapshotWasClicked','newClipWasClicked'])

const openMhtml = () => window.open(chrome.runtime.getURL(`www/index.html#/mainpanel/${props.extension}/${props.snapshotId}`));
// const openMhtml = () => window.open(chrome.runtime.getURL(`www/mirror.html#/mainpanel/${props.extension}/${props.tabId}/${props.index}`));
const deleteSnapshot = () => useSnapshotsService().deleteSnapshot(props.snapshotId)

const title = () => {
  switch (props.extension.toLowerCase()) {
    case "mhtml":
      return "MHtml Snapshot"
    case "html":
      return "HTML Snapshot"
    case "png":
      return "Image Snapshot"
    case "pdf":
      return "PDF Snapshot"
    default:
      return "Session"
  }
}

const compareWith = async (other: BlobMetadata) => {
  const blob = await useSnapshotsService().getMetadataById(props.snapshotId)
  // console.log("blob", blob)
  // if (blob) {
  //   const data = await useSnapshotsService().getBlobFor(blob?.blobId)
  //   //console.log("data", data)
  //   const c = await data!.text()
  //   const converted = mhtml2html.convert(c)
  //   const htmlBlob = converted.window.document.documentElement.innerHTML
  //   //console.log("htmlBlob", htmlBlob)
  //
  //   const diff = HtmlDiff.execute("htmlBlob", "htmlBlob");
  //   console.log("---diff---", diff)
  //
  // }
}

</script>
