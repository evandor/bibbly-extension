import Command from "src/domain/Command";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useUtils} from "src/services/Utils";
import {useProjectsStore} from "src/projects/stores/projectsStore";
import {Project} from "src/projects/models/Project";

const {sendMsg} = useUtils()

export class CreateProjectCommand implements Command<Project> {

  constructor(
    public name: string,
    public description: string) {
  }

  async execute(): Promise<ExecutionResult<Project>> {
    try {
      //const trustedWindowName = this.windowToOpen.replace(STRIP_CHARS_IN_USER_INPUT, '')
      const result = await useProjectsStore().createProject(this.name, this.description)
      return Promise.resolve(new ExecutionResult<Project>(result, "Project created"))
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

CreateProjectCommand.prototype.toString = function cmdToString() {
  return `CreateProjectCommand: {name=${this.name}, {description=${this.description}}`;
};
