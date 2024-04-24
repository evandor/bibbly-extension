import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {ListDetailLevel} from "stores/uiStore";
import {Tab} from "src/projects/models/Tab";



export const TABSET_NAME_MAX_LENGTH = 32;

export class Project {
  id: string

  name: string
  created: number
  updated: number
  //tabs: Tab[]
  description: string

  constructor(id: string, name: string, description: string) {

    // some guards
    if (!Project.newTabsetNameIsValid) {
      throw new Error(`Tabset name '${name}' is not valid`)
    }
    if (!Project.newTabsetNameIsShortEnough) {
      throw new Error(`Tabset name '${name}' is too long`)
    }

    // assignments
    this.id = id
    this.name = name
    this.created = new Date().getTime()
    this.updated = new Date().getTime()
    //this.tabs = tabs
  }

  static newTabsetNameIsValid = (val: string) => {
    return !STRIP_CHARS_IN_USER_INPUT.test(val)
  }

  static newTabsetNameIsShortEnough = (val: string) => val ? val.length <= TABSET_NAME_MAX_LENGTH : true

}
