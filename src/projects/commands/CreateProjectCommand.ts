import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useUtils} from "src/services/Utils";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {StaticSuggestionIdent, Suggestion} from "src/models/Suggestion";
import {useProjectsStore} from "src/projects/stores/projectsStore";

const {sendMsg} = useUtils()

export class CreateProjectCommand implements Command<any> {

  constructor(
    public name: string,
    public description: string) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    try {
      //const trustedWindowName = this.windowToOpen.replace(STRIP_CHARS_IN_USER_INPUT, '')
      const result = await useProjectsStore().createProject(this.name, this.description)
      return Promise.resolve(new ExecutionResult<any>(result, "Project created"))
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

CreateProjectCommand.prototype.toString = function cmdToString() {
  return `CreateProjectCommand: {name=${this.name}, {description=${this.description}}`;
};
