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
        // .then(res => {
        //   //JsUtils.gaEvent('tabset-created', {"tabsCount": this.tabsToUse.length})
        //   //Analytics.fireEvent('tabset-created', {"tabsCount": this.tabsToUse.length})
        //   return res
        // })
        // .then((res:any) => {
        //     if (useTabsStore().tabsets.size >= 15 &&
        //       process.env.MODE === 'bex') {
        //       useSuggestionsStore().addSuggestion(Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_SPACES_FEATURE))
        //     }
        //     //sendMsg('tabset-added', {tabsetId: res.tabset.id})
        //     return res
        //   }
       // )
      let doneMsg = 'Tabset created'
      return Promise.resolve(new ExecutionResult<any>(result, doneMsg))
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

CreateProjectCommand.prototype.toString = function cmdToString() {
  return `CreateProjectCommand: {name=${this.name}, {description=${this.description}}`;
};
