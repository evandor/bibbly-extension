import {Project} from "src/projects/models/Project";

interface ProjectsPersistence {

  getServiceName(): string

  init(): Promise<any>

  saveProject(project: Project): void
  getProjects(): Promise<Project[]>
  findProjectById(id: string): Promise<Project>
  deleteProject(projectId: string): Promise<void>;

  compactDb(): Promise<any>

}

export default ProjectsPersistence
