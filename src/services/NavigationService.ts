import {openURL} from "quasar";
import {useNotificationHandler} from "src/core/services/ErrorHandler";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {useTabsetService} from "src/tabsets/services/TabsetService2";
import {useWindowsStore} from "src/windows/stores/windowsStore";
import JsUtils from "src/utils/JsUtils";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import {RefreshTabCommand} from "src/tabsets/commands/RefreshTabCommand";
import _ from "lodash"

/**
 * refactoring remark: uses many other modules, needs to be one-per-application
 *
 */
class NavigationService {

  placeholderPattern = /\${[^}]*}/gm

  async openChromeTab(chromeTab: chrome.tabs.Tab) {
    const window = await chrome.tabs.highlight({windowId: chromeTab.windowId, tabs: chromeTab.index})
    if (typeof window.id === "number") {
      await chrome.windows.update(window.id, {focused: true})
    }
  }

  async openOrCreateTab(
    withUrls: string[],
    matcher: string | undefined = undefined,
    groups: string[] = [],
    forceCurrent: boolean = false,
    forceReload: boolean = false
  ) {
    withUrls.map(u => u.replace(this.placeholderPattern, ""));
    const useWindowIdent = 'current'//this.getUseWindowIdent(forceCurrent, withUrls)
    console.log(` > opening url(s) ${withUrls} in window: '${useWindowIdent}', groups: '${groups}', mode: '${process.env.MODE}'`)

    //const windowFromDb = await useWindowsStore().windowFor(useWindowIdent)
    const existingWindow = await useWindowsStore().currentWindowFor(useWindowIdent)

    if (process.env.MODE === "bex") {
      for (const url of withUrls) {
        // get all tabs with this url
        const tabsForUrl = useTabsetsStore().tabsForUrl(url) || []
        tabsForUrl.forEach(t => {
          if (t.tab.httpInfo) {
            t.tab.httpError = ''
            t.tab.httpInfo = ''

            const ts = useTabsetsStore().tabsetFor(t.tab.id)
            if (ts) {
              //console.log("saving tabset ", ts)
              useTabsetService().saveTabset(ts)
            }
          }
        })
      }

      const useWindowId = existingWindow?.id || chrome.windows.WINDOW_ID_CURRENT
      const queryInfo = {windowId: useWindowId}

      // getting all tabs from this window
      chrome.tabs.query(queryInfo, (t: chrome.tabs.Tab[]) => {
        const ctx = this
        withUrls.forEach(function (url, i) {
          let found = false;
          t.filter(r => r.url)
            .map(r => {
              let matchCondition = url === r.url
              if (matcher && r.url) {
                //console.log("matcher yielded", JsUtils.match(matcher, r.url))
                matchCondition = JsUtils.match(matcher, r.url)
              }
              // console.log("===>", matchCondition, url, r.url)
              if (matchCondition) {
                if (!found) { // highlight only first hit
                  found = true
                  console.debug("found something", r)

                  const tabsForUrl = useTabsetsStore().tabsForUrl(url)
                  console.log("tabsForUrl", tabsForUrl)
                  const lastActive = _.min(_.map(tabsForUrl, tfu => tfu.tab.lastActive))
                  const {handleSuccess} = useNotificationHandler()
                  if (r.active) {
                    console.log(`lastActive ${lastActive}, now: ${new Date().getTime()}, diff: ${new Date().getTime() - (lastActive || new Date().getTime())}`)
                    if (lastActive && new Date().getTime() - lastActive > 1000 * 60) {
                      handleSuccess(new ExecutionResult("", "already opened,...", new Map([["Refresh", new RefreshTabCommand(r.id!, url)]])))
                    } else {
                      handleSuccess(new ExecutionResult("", "already opened..."))
                    }
                  } else {
                    if (lastActive && new Date().getTime() - lastActive > 1000 * 60) {
                      handleSuccess(new ExecutionResult("", "maybe outdated...", new Map([["Refresh?", new RefreshTabCommand(r.id!, url)]])))
                    }
                  }
                  chrome.tabs.highlight({tabs: r.index, windowId: useWindowId});
                  chrome.windows.update(useWindowId, {focused: true})

                  if (forceReload && r.id) {
                    console.debug("forced reload")
                    chrome.tabs.reload(r.id)
                  }

                  if (groups.length > i) {
                    //ctx.handleGroup(groups[i], useWindowId, r);
                  }
                }
              }
            });
          if (!found) {
            console.debug("tab not found, creating new one:", url)
            chrome.tabs.create({
              active: true,
              pinned: false,
              url: url,
              windowId: useWindowId
            }, (tab: chrome.tabs.Tab) => {
              chrome.windows.update(useWindowId, {focused: true})

              // if (!useFeaturesStore().hasFeature(FeatureIdent.ANALYSE_TABS)) {
              //   setTimeout(() => {
              //     // check potential redirect
              //     chrome.tabs.get(tab.id || 0, (potentiallyChangedTab: chrome.tabs.Tab) => {
              //       if (tab.url !== potentiallyChangedTab.url && tab.url?.trim() !== "" && potentiallyChangedTab.url?.trim() !== "") {
              //         console.log("tab's URL change during one second, assuming 30x redirect, creating suggestion", tab, potentiallyChangedTab)
              //         const suggestionId = uid()
              //         const suggestion = new Suggestion(suggestionId,
              //           "Tab's URL changed", "Seems like the tab's URL has changed according to the server. " +
              //           "Should the URL be updated?",
              //           "/suggestions/" + suggestionId,
              //           SuggestionType.REDIRECT_HAPPENED_FOR_TAB)
              //         suggestion.setData({url, location: potentiallyChangedTab.url})
              //         useSuggestionsStore().addSuggestion(suggestion).catch((err) => {
              //           console.log("got error", err)
              //         })
              //       }
              //     })
              //   }, 1000)
              // }

              if (groups.length > i) {
                // ctx.handleGroup(groups[i], useWindowId, tab);
              }

            })

          }
        })
      })
    } else {
      openURL(withUrls[0])
    }
  }

  private getUseWindowIdent(forceCurrent: boolean, urls: string[]) {
    return 'current'
  }

  async openSingleTab(url: string): Promise<chrome.tabs.Tab> {
    return await chrome.tabs.create({url: url})
  }

  closeChromeTab(tab: chrome.tabs.Tab) {
    console.log("closing chrome tab", tab.id, tab?.id)
    try {
      chrome.tabs.remove(tab.id || 0)
    } catch (err) {
      console.log("error clsosing chrome tab", err)
    }
  }

  private async createNewWindow(createData: any, useWindowIdent: string, withUrls: string[], groups: string[]) {
    console.log("opening new window with", createData)
    // https://developer.chrome.com/articles/window-management/
    //let screenlabel: string | undefined = undefined
    // if ('getScreenDetails' in window) {
    //     // @ts-ignore
    //     const screens = await window.getScreenDetails();
    //     screenlabel = screens.currentScreen.label
    //     console.log("setting screenlabel to", screenlabel)
    // }

    chrome.windows.create(createData, (window) => {
      //console.log("creating window", useWindowIdent, window)
      if (chrome.runtime.lastError) {
        // probably out of bounds issues
        chrome.windows.create({}, (window) => {
          if (window) {
            this.createWindow(useWindowIdent, window, 0, withUrls, groups);
          }
        })
      } else if (window) {
        this.createWindow(useWindowIdent, window, 0, withUrls, groups);
      }
    })

  }

  private createWindow(useWindowIdent: string, window: chrome.windows.Window, index: number = 0, withUrls: string[], groups: string[]) {
    //useWindowsStore().assignWindow(useWindowIdent, window.id || 0)
    useWindowsStore().upsertWindow(window, useWindowIdent, index)
    const ctx = this
    withUrls.forEach(function (url, i) {
      if (groups.length > i) {
        const group = groups[i]
        if (group && window.id && window.tabs && window.tabs.length > i) {
          console.log("assiging group", group, i)
//ctx.handleGroup(group, window.id, window.tabs[i]);
        }
      }
    })
  }
}

export default new NavigationService();

