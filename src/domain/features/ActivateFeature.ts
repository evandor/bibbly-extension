import Command from "src/domain/Command";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {AppFeature} from "src/models/AppFeature"


export class ActivateFeatureCommand implements Command<any> {

  constructor(
    public feature: AppFeature) {
  }


  async execute(): Promise<ExecutionResult<any>> {
    console.log("this.feature", this.feature.ident.toLowerCase())
    usePermissionsStore().activateFeature(this.feature.ident.toLowerCase())
    return Promise.resolve(
      new ExecutionResult(
        "done",
        `Feature ${this.feature.ident.toLowerCase()} was activated`))
  }

}

ActivateFeatureCommand.prototype.toString = function cmdToString() {
  return `ActivateFeatureCommand: {feature=${this.feature.ident}}`;
};
