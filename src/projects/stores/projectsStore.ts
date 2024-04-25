import {defineStore} from 'pinia';
import {Project} from "src/projects/models/Project";
import {uid} from "quasar";
import ProjectsPersistence from "src/projects/persistence/ProjectsPersistence";
import IndexedDbProjectsPersistence from "src/projects/persistence/IndexedDbProjectsPersistence";
import {ref} from "vue";

/**
 * a pinia store for "Projects".
 *
 * Elements are persisted to the storage provided in the initialize function
 */

let storage: ProjectsPersistence

export const useProjectsStore =
  defineStore('projects', () => {

    const projects = ref<Project[]>([])

    async function initialize() {
      console.debug(" ...initializing projectsStore")
      storage = IndexedDbProjectsPersistence
      await storage.init()
      //await setup("initialization")
      projects.value = await storage.getProjects()
    }

    async function createProject(name: string, description: string) {
      const newProject = new Project(uid(), name, description)
      storage.saveProject(newProject)
      projects.value = await storage.getProjects()
//updated.value = new Date().getTime()
      return Promise.resolve(newProject)
    }

    async function updateProject(p: Project) {
      storage.saveProject(JSON.parse(JSON.stringify(p)))
      projects.value = await storage.getProjects()
    }

    async function findProject(id: string) {
      console.log("search for project", id)
      return await storage.findProjectById(id)
    }

    return {
      initialize,
      createProject,
      projects,
      findProject,
      updateProject
    }
  })
