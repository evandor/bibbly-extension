import {useUtils} from "src/core/services/Utils";
import {useUiStore} from "src/ui/stores/uiStore";
import {SidePanelViews} from "src/models/SidePanelViews";
import {useTabsStore2} from "src/tabsets/stores/tabsStore2";

async function setCurrentTab() {
  const tabs = await chrome.tabs.query({active: true, lastFocusedWindow: true})

  //console.debug("setting current tab", tabs)
  if (tabs && tabs[0]) {
    useTabsStore2().setCurrentChromeTab(tabs[0] as unknown as chrome.tabs.Tab)
  } else {
    // Seems to be necessary when creating a new chrome group
    const tabs2 = await chrome.tabs.query({active: true})
    //console.log("setting current tab II", tabs2)
    if (tabs2 && tabs2[0]) {
      useTabsStore2().setCurrentChromeTab(tabs2[0] as unknown as chrome.tabs.Tab)
    }
  }
}

const {inBexMode} = useUtils()

function inIgnoredMessages(request: any) {
  // TODO name vs. msg!
  return request.name === 'progress-indicator' ||
    request.name === 'feature-activated' ||
    request.name === 'feature-deactivated' ||
    request.name === 'restore-selection' ||
    request.name === 'text-selection' ||
    request.action === 'highlight-annotation'

}


class ChromeListeners {

  inProgress = false;

  private onUpdatedListener = (number: number, info: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => this.onUpdated(number, info, tab)
  private onMessageListener = (request: any, sender: chrome.runtime.MessageSender, sendResponse: any) => this.onMessage(request, sender, sendResponse)

  async initListeners() {

    if (process.env.MODE === 'bex') {
      console.debug(" ...initializing chrome tab listeners")

      await setCurrentTab()

      chrome.tabs.onUpdated.addListener(this.onUpdatedListener)
      chrome.runtime.onMessage.addListener(this.onMessageListener)
    }

    // https://stackoverflow.com/questions/77089404/chrom-extension-close-event-not-available-on-sidepanel-closure
    if (inBexMode() && chrome && chrome.runtime) {
      chrome.runtime.connect({name: 'tabsetsSidepanel'});
    }

  }

  async resetListeners() {
    console.log(" ...resetting listeners (after re-initialization)")
    chrome.tabs.onUpdated.removeListener(this.onUpdatedListener)
    chrome.runtime.onMessage.removeListener(this.onMessageListener)
  }

  clearWorking() {
    if (this.inProgress) {

    }
    this.inProgress = false
  }

  async onUpdated(number: number, info: chrome.tabs.TabChangeInfo, chromeTab: chrome.tabs.Tab) {

    // set current chrome tab in tabsStore
    await setCurrentTab()

    if (!info.status || (Object.keys(info).length > 1)) {
      console.debug(`onUpdated:   tab ${number}: >>> ${JSON.stringify(info)}, opened by ${chromeTab.openerTabId} <<<`)

      // handle pending Tabset
      //this.handleUpdate(tabsStore.pendingTabset as Tabset, chromeTab)
      this.handleUpdateInjectScripts(info, chromeTab)
    }
  }


  private handleUpdateInjectScripts(info: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    if (info.status !== "loading") {
      return
    }
    if (!tab.id) {
      return
    }

    if (tab.url && tab.url.startsWith("https://shared.tabsets.net")) {
      return
    }

    const scripts: string[] = []

    scripts.push("content-script-thumbnails.js")
    scripts.push("content-script.js")

    // scripts.push("tabsets-content-script.js")
    if (scripts.length > 0 && tab.id !== null) { // && !this.injectedScripts.get(.chromeTabId)) {

      chrome.tabs.get(tab.id, (chromeTab: chrome.tabs.Tab) => {
        if (chrome.runtime.lastError) {
          console.warn("got runtime error:" + chrome.runtime.lastError);
        }
        if (tab.id && !tab.url?.startsWith("chrome")) {
          scripts.forEach((script: string) => {
            //console.debug("executing scripts", tab.id, script)


            // @ts-ignore
            chrome.scripting.executeScript({
              target: {tabId: tab.id, allFrames: false},
              files: [script] //["tabsets-content-script.js","content-script-thumbnails.js"],
            }, (callback: any) => {
              if (chrome.runtime.lastError) {
                console.warn("could not execute script: " + chrome.runtime.lastError.message, info.url);
              }
            });
          })
        }
      })
    }
  }

  async onActivated(info: chrome.tabs.TabActiveInfo) {
    //this.eventTriggered()
    console.debug(`onActivated: tab ${info.tabId} activated: >>> ${JSON.stringify(info)}`)

    await setCurrentTab()

    chrome.tabs.get(info.tabId, tab => {
      if (chrome.runtime.lastError) {
        console.warn("got runtime error:" + chrome.runtime.lastError);
      }
      const url = tab.url
      if (url) {
       // useTabsetService().urlWasActivated(url)
      }
    })
  }

  onMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: any) {
    console.log("tabsets: ===>", request)
    if (inIgnoredMessages(request)) {
      return true
    }
    console.debug(" <<< got message in ChromeListeners", request)
    if (request.msg === 'captureThumbnail') {
    } else if (request.msg === 'html2text') {
    } else if (request.name === 'sidepanel-switch-view') {
      useUiStore().sidePanelSetActiveView(SidePanelViews.MAIN)
    } else {
      console.log("got unknown message", request)
    }
    return true;
  }

}

export default new ChromeListeners();

