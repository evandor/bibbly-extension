import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useUtils} from "src/services/Utils";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {StaticSuggestionIdent, Suggestion} from "src/models/Suggestion";
import Analytics from "src/utils/google-analytics";
import {useWindowsStore} from "src/windows/stores/windowsStore";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {useTabsetService} from "src/lists/services/TabsetService2";
import {TabsetType} from "src/lists/models/Tabset";
import {useTabsStore} from "src/lists/stores/tabsStore";

const {sendMsg} = useUtils()

export class CreateListCommand implements Command<any> {

  public merge: boolean = true

  constructor(
    public tabsetName: string,
    public tabsToUse: chrome.tabs.Tab[],
    public windowToOpen: string = 'current',
    public color: string | undefined = undefined) {
  }

  async execute(): Promise<ExecutionResult<any>> {
    try {
      //const trustedWindowName = this.windowToOpen.replace(STRIP_CHARS_IN_USER_INPUT, '')
      const windowId = this.windowToOpen ?
        this.windowToOpen.replace(STRIP_CHARS_IN_USER_INPUT, '') : 'current'
      useWindowsStore().addToWindowSet(windowId)
      const result: SaveOrReplaceResult = await useTabsetService()
        .saveOrReplaceFromChromeTabs(this.tabsetName, this.tabsToUse, this.merge, windowId, TabsetType.DEFAULT, this.color)
        .then(res => {
          //JsUtils.gaEvent('tabset-created', {"tabsCount": this.tabsToUse.length})
          Analytics.fireEvent('tabset-created', {"tabsCount": this.tabsToUse.length})
          return res
        })
        .then(res => {
            //   if (useTabsStore().tabsets.size === 5 && !usePermissionsStore().hasFeature(FeatureIdent.BOOKMARKS) && process.env.MODE === 'bex') {
            //     useSuggestionsStore().addSuggestion(Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_BOOKMARKS_FEATURE))
            //         }
            if (useTabsStore().tabsets.size >= 15 &&
              process.env.MODE === 'bex') {
              useSuggestionsStore().addSuggestion(Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_SPACES_FEATURE))
            }
            sendMsg('tabset-added', {tabsetId: res.tabset.id})
            return res
          }
        )
      let doneMsg = 'Tabset created'
      return Promise.resolve(new ExecutionResult<any>(result, doneMsg))
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

CreateListCommand.prototype.toString = function cmdToString() {
  return `CreateListCommand: {merge=${this.merge}, tabsetName=${this.tabsetName}, tabs#=${this.tabsToUse.length}, windowToOpen#=${this.windowToOpen}}`;
};
