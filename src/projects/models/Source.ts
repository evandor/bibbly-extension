import {uid} from "quasar";

export class Source {
  id: string

  name: string
  private created: number;
  private updated: number;
  public url: string;
  public favIconUrl: string | undefined;

  constructor(id: string, name: string, url: string, favIconUrl: string | undefined = undefined) {

    // assignments
    this.id = id
    this.name = name
    this.url = url
    this.favIconUrl = favIconUrl
    this.created = new Date().getTime()
    this.updated = new Date().getTime()
  }


  static newFrom(tab: chrome.tabs.Tab) {
    return new Source(uid(), tab.title || '', tab.url || '', tab.favIconUrl )
  }
}
