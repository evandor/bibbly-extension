import Command from "src/core/domain/Command";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useUtils} from "src/core/services/Utils";
import {useProjectsStore} from "src/projects/stores/projectsStore";
import {Project} from "src/projects/models/Project";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {Tabset} from "src/tabsets/models/Tabset";

const {sendMsg} = useUtils()

export class CreateProjectCommand implements Command<Tabset> {

  constructor(
    public name: string,
    public description: string) {
  }

  async execute(): Promise<ExecutionResult<Tabset>> {
    try {
      //const trustedWindowName = this.windowToOpen.replace(STRIP_CHARS_IN_USER_INPUT, '')
      await useProjectsStore().createProject(this.name, this.description)

      const result = await useTabsetsStore().createTabset(this.name, [])

      return Promise.resolve(new ExecutionResult<Tabset>(result, "Project created"))
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

CreateProjectCommand.prototype.toString = function cmdToString() {
  return `CreateProjectCommand: {name=${this.name}, {description=${this.description}}`;
};
