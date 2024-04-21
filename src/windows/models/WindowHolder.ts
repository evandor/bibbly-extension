import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";

export class WindowAction {

  constructor(
    public icon: string,
    public action: string | undefined = undefined,
    public color: string = "text-grey",
    public tooltip: string | undefined = undefined,
    public disabled: boolean = false
  ) {

  }
}

export class WindowHolder {
  created: number

  private constructor(
    public cw: chrome.windows.Window,
    public index: number,
    public name: string,
    public hostList: string[],
    public additionalActions: WindowAction[]) { // could not use sets due to issues

    this.created = new Date().getTime()
    this.name = this.name?.replace(STRIP_CHARS_IN_USER_INPUT, '')
    if (!WindowHolder.nameIsShortEnough) {
      throw new Error(`Window name '${name}' is too long`)
    }
  }

  static nameIsShortEnough = (val: string) => val ? val.length <= 32 : true

  public static of(browserWindow: chrome.windows.Window, index:number, name: string, hostList: string[], additionalActions: WindowAction[]): WindowHolder {
    return new WindowHolder(browserWindow, index, name, hostList, additionalActions);
  }

  public getId() {
    return this.cw.id || -1
  }

  public getName() {
    return this.name
  }

  public getIndex() {
    return this.index
  }

  public getTabsCount() {
    return this.cw.tabs?.length || 0
  }

}

//     const windowHolder = new WindowHolder(cw.id, windowFromStore?.index || 0,cw.tabs?.length || 0,useWindowsStore().windowNameFor(cw.id || 0) || cw.id!.toString())

WindowHolder.prototype.toString = function tabToString() {
  return `WindowHolder: {id=${this.cw.id}, name=${this.name}, index=${this.index}}`;
};

// id: cw.id,
//   tabsCount: cw.tabs?.length || 0,
//   name: useWindowsStore().windowNameFor(cw.id || 0) || cw.id!.toString(),
//   windowHeight: cw['height' as keyof object],
//   windowWidth: cw['width' as keyof object],
//   focused: cw.focused,
//   alwaysOnTop: cw.alwaysOnTop,
//   incognito: cw.incognito,
//   sessionId: cw.sessionId,
//   state: cw.state,
//   type: cw.type,
//   windowIcon: "*",
//   hostList: windowFromStore?.hostList,
//   additionalActions: [{icon: "o_bookmark_add"}]
