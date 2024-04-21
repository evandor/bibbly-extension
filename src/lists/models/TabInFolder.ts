import {Tab} from "src/lists/models/Tab";
import {Tabset} from "src/lists/models/Tabset";

export class TabInFolder {
  constructor(public tab:Tab, public folder: Tabset) {
  }
}
