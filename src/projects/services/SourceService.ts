import {Project} from "src/projects/models/Project";
import {Source} from "src/projects/models/Source";
import {useProjectsStore} from "src/projects/stores/projectsStore";
import _ from "lodash"
import {useSnapshotsService} from "src/snapshots/services/SnapshotsService";
import {BlobMetadata, BlobType} from "src/snapshots/models/BlobMetadata";
import {useSnapshotsStore} from "src/snapshots/stores/SnapshotsStore";

export function useSourceService() {

  const deleteSource = async (source: Source, project: Project) => {
    console.log(`deleting source ${source.id} in project ${project.id}`)
    const mds = await useSnapshotsService().getMetadataFor(source.id, BlobType.HTML)
    mds.forEach((md:BlobMetadata) => {
      useSnapshotsStore().deleteBlob(md.blobId)
      useSnapshotsStore().deleteMetadataForSource(source.id)
    })
    // if (tabsetsFor(tabUrl).length <= 1) {
    //   useThumbnailsService().removeThumbnailsFor(tabUrl)
    //     .then(() => console.debug("deleting thumbnail for ", tabUrl))
    //     .catch(err => console.log("error deleting thumbnail", err))
    //
    //   removeContentFor(tabUrl)
    //     .then(() => console.debug("deleting content for ", tabUrl))
    //     .catch(err => console.log("error deleting content", err))
    // }
    //useTabsStore2().removeTab(tabset, tab.id)
    const p = _.find(useProjectsStore().projects as Project[], (p:Project) => p.id === project.id )
    if (p) {
      p.sources = p.sources.filter((s:Source) => s.id !== source.id)
      return useProjectsStore().saveProject(JSON.parse(JSON.stringify(p)))
        .then(() => project)
    } else {
      console.warn(`project ${project.id} not found`)
    }
  }

  return {
    deleteSource
  }
}
