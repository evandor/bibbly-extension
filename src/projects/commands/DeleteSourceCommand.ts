import Command from "src/core/domain/Command";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {useUtils} from "src/core/services/Utils";
import {Source} from "src/projects/models/Source";
import {Project} from "src/projects/models/Project";
import {useSourceService} from "src/projects/services/SourceService";

const {inBexMode, sendMsg} = useUtils()

// class UndoCommand implements Command<any> {
//
//
//   constructor(public tabset: Tabset, public tab: Tab) {
//   }
//
//   execute(): Promise<ExecutionResult<any>> {
//     console.log("execution undo command", this.tab, this.tabset)
//     // return addToTabset(this.tabset, this.tab)
//     //   .then((res) => {
//     //     useTabsetService().saveCurrentTabset()
//     //     return new ExecutionResult(res, "Tab has been restored again")
//     //   })
//   }
//
// }

export class DeleteSourceCommand implements Command<Source> {

  constructor(
    public source: Source,
    public project: Project
  ) {
  }

  async execute(): Promise<ExecutionResult<Source>> {
    return useSourceService().deleteSource(this.source, this.project)
       .then((p:Project) => {
          return new ExecutionResult<Source>(this.source, "done")
       })
      //   // sharing
      //   if (tabset.sharedId && tabset.sharing === TabsetSharing.PUBLIC_LINK) {
      //     tabset.sharing = TabsetSharing.PUBLIC_LINK_OUTDATED
      //     tabset.sharedAt = new Date().getTime()
      //   }
      //   return tabset
      // })
      // .then(tabset => Promise.resolve(new ExecutionResult(
      //   tabset,
      //   "Tab was deleted"))
      //   //new Map([["Undo", new UndoCommand(tabset, this.tab)]]))))
      // .then((res) => {
      //   sendMsg('tab-deleted', {tabsetId: res.result.id})
      //   return res
      // })
      // .catch(err => Promise.reject(err))
  }
}


DeleteSourceCommand.prototype.toString = function cmdToString() {
  return `DeleteSourceCommand: {tab.id=${this.tab.id}, tab.url=${this.tab.url}}`;
};
