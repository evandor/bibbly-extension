import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {ListDetailLevel} from "stores/uiStore";
import {Tab} from "src/lists/models/Tab";

export enum TabsetStatus {
  DEFAULT = "DEFAULT",
  FAVORITE = "FAVORITE",
  DELETED = "DELETED",
  HIDDEN = "HIDDEN"
}

export enum TabsetType {
  DEFAULT = "DEFAULT",
  SESSION = "SESSION",
  SPECIAL = "SPECIAL",
  DYNAMIC = "DYNAMIC"
}

export enum TabsetSharing {
  UNSHARED = "UNSHARED",
  PUBLIC_LINK = "PUBLIC_LINK",
  PUBLIC_LINK_OUTDATED = "PUBLIC_LINK_OUTDATED",
  USER = "USER",
  ROLE = "ROLE"
}


export const TABSET_NAME_MAX_LENGTH = 32;

export class Tabset {
  id: string

  name: string
  created: number
  updated: number
  tabs: Tab[]

  folders: Tabset[] = []
  folderActive: string | undefined = undefined
  folderParent: string | undefined = undefined

  view: string = 'list'
  details: ListDetailLevel | undefined = undefined
  sorting: string = 'custom'
  status: TabsetStatus = TabsetStatus.DEFAULT
  type: TabsetType = TabsetType.DEFAULT

  // sharing
  sharing: TabsetSharing = TabsetSharing.UNSHARED
  sharedBy: string | undefined = undefined
  sharedById: string | undefined = undefined
  sharedId: string | undefined = undefined
  sharedAt: number | undefined = undefined
  sharedPath: string | undefined = undefined // e.g. /pwa/imp/AlCYSrGGmOnsOnf0htA9?n=c2hvcHBpbmc=

  // messaging
  mqttUrl: string | undefined = undefined

  importedAt: number | undefined = undefined

  canvas: object | undefined = undefined

  // = description
  page: string | undefined = undefined

  headerDescription: string | undefined = undefined

  window: string = 'current'
  color: string | undefined = undefined

  // can be set (to the installtion.id) when saving the tabset in order to omit triggering an update
  origin: string = ''

  constructor(id: string, name: string, tabs: Tab[]) {

    // some guards
    if (!Tabset.newTabsetNameIsValid) {
      throw new Error(`Tabset name '${name}' is not valid`)
    }
    if (!Tabset.newTabsetNameIsShortEnough) {
      throw new Error(`Tabset name '${name}' is too long`)
    }

    // assignments
    this.id = id
    this.name = name
    this.created = new Date().getTime()
    this.updated = new Date().getTime()
    this.tabs = tabs
  }

  static newTabsetNameIsValid = (val: string) => {
    return !STRIP_CHARS_IN_USER_INPUT.test(val)
  }

  static newTabsetNameIsShortEnough = (val: string) => val ? val.length <= TABSET_NAME_MAX_LENGTH : true

}
